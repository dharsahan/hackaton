import ee from '@google/earthengine';
import jwt from 'jsonwebtoken';

let initialized = false;

function getCredentials() {
    const email = process.env.GEE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GEE_PRIVATE_KEY;

    if (!email || !key) {
        throw new Error(
            'GEE_SERVICE_ACCOUNT_EMAIL and GEE_PRIVATE_KEY must be set in .env.local. ' +
            'See: https://developers.google.com/earth-engine/guides/service_account'
        );
    }

    return {
        client_email: email,
        private_key: key.replace(/\\n/g, '\n'),
    };
}

/**
 * Detect clock skew by comparing local time with Google's server time.
 * Returns the offset in seconds (positive = local clock is ahead).
 */
async function detectClockSkew(): Promise<number> {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const res = await fetch('https://www.google.com', {
            method: 'HEAD',
            signal: controller.signal,
        });
        clearTimeout(timeout);

        const serverDate = res.headers.get('date');
        if (serverDate) {
            const serverTime = new Date(serverDate).getTime();
            const localTime = Date.now();
            return Math.floor((localTime - serverTime) / 1000);
        }
    } catch {
        // If we can't detect skew, return 0
    }
    return 0;
}

/**
 * Obtain an OAuth2 access token using a manually-constructed JWT
 * with clock-skew-corrected timestamps.
 */
async function getAccessToken(credentials: { client_email: string; private_key: string }): Promise<string> {
    const skewSeconds = await detectClockSkew();
    console.log(`[EE Auth] Detected clock skew: ${skewSeconds}s (${(skewSeconds / 3600).toFixed(1)}h)`);

    const nowCorrected = Math.floor(Date.now() / 1000) - skewSeconds;

    const payload = {
        iss: credentials.client_email,
        scope: 'https://www.googleapis.com/auth/earthengine',
        aud: 'https://oauth2.googleapis.com/token',
        iat: nowCorrected,
        exp: nowCorrected + 3600,
    };

    const assertion = jwt.sign(payload, credentials.private_key, { algorithm: 'RS256' });

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion,
        }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
        throw new Error(`Token exchange failed: ${tokenData.error_description || tokenData.error || JSON.stringify(tokenData)}`);
    }

    return tokenData.access_token;
}

export async function initializeEE(): Promise<void> {
    if (initialized) return;

    const credentials = getCredentials();
    const accessToken = await getAccessToken(credentials);

    return new Promise((resolve, reject) => {
        ee.data.setAuthToken(
            '',
            'Bearer',
            accessToken,
            3600,
            [],
            () => {
                ee.initialize(
                    null,
                    null,
                    () => {
                        initialized = true;
                        console.log('[EE Auth] Earth Engine initialized successfully');
                        resolve();
                    },
                    (err: Error) => reject(new Error(`EE initialization failed: ${err}`))
                );
            },
            false
        );
    });
}

export interface NDVIResult {
    tileUrl: string;
    ndviStats: {
        mean: number;
        min: number;
        max: number;
    };
    soilMoisture: number;
    rootZoneMoisture?: number; // Added from SMAP
    humidity: number;
    timestamp: string;
    satellite: string;
}

export interface FieldCoordinate {
    lon: number;
    lat: number;
}

export async function analyzeFieldNDVI(
    coordinates: FieldCoordinate[],
    startDate?: string,
    endDate?: string
): Promise<NDVIResult> {
    await initializeEE();

    const now = new Date();
    const end = endDate || now.toISOString().split('T')[0];
    const start = startDate || new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];

    const coords = coordinates.map(c => [c.lon, c.lat]);
    const polygon = ee.Geometry.Polygon([coords]);

    const s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
        .filterBounds(polygon)
        .filterDate(start, end)
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
        .sort('CLOUDY_PIXEL_PERCENTAGE');

    const maskClouds = (image: any) => {
        const scl = image.select('SCL');
        const mask = scl.neq(3).and(scl.neq(8)).and(scl.neq(9)).and(scl.neq(10));
        return image.updateMask(mask);
    };

    const masked = s2.map(maskClouds);

    const addNDVI = (image: any) => {
        const ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');
        return image.addBands(ndvi);
    };

    const withNDVI = masked.map(addNDVI);
    const composite = withNDVI.median().select('NDVI');

    const visParams = {
        min: -0.1,
        max: 0.8,
        palette: ['#d73027', '#fc8d59', '#fee08b', '#d9ef8b', '#91cf60', '#1a9850'],
    };

    const mapId = composite.clip(polygon).getMapId(visParams);
    const tileUrl = mapId.urlFormat;

    const stats = await computeNDVIStats(composite, polygon);
    const latestImage = s2.first();
    const imageDate = await getImageDate(latestImage);

    // Fetch soil moisture from NASA SMAP
    const smapData = await fetchSMAPData(polygon, start, end);

    // Fetch humidity from ERA5-Land (keep for humidity)
    const era5Data = await fetchSoilData(polygon, start, end);

    return {
        tileUrl,
        ndviStats: stats,
        soilMoisture: smapData.surfaceMoisture > 0 ? smapData.surfaceMoisture : era5Data.soilMoisture, // Prefer SMAP
        rootZoneMoisture: smapData.rootZoneMoisture,
        humidity: era5Data.humidity,
        timestamp: imageDate,
        satellite: 'Sentinel-2 + SMAP',
    };
}

function computeNDVIStats(
    ndviImage: any,
    region: any
): Promise<{ mean: number; min: number; max: number }> {
    return new Promise((resolve, reject) => {
        const stats = ndviImage.reduceRegion({
            reducer: ee.Reducer.mean()
                .combine(ee.Reducer.min(), '', true)
                .combine(ee.Reducer.max(), '', true),
            geometry: region,
            scale: 10,
            maxPixels: 1e9,
        });

        stats.evaluate((result: any, err: any) => {
            if (err) {
                reject(new Error(`Failed to compute NDVI stats: ${err}`));
                return;
            }

            resolve({
                mean: result?.NDVI_mean ?? 0,
                min: result?.NDVI_min ?? 0,
                max: result?.NDVI_max ?? 0,
            });
        });
    });
}

function getImageDate(image: any): Promise<string> {
    return new Promise((resolve) => {
        const date = ee.Date(image.get('system:time_start'));
        date.format('YYYY-MM-dd').evaluate((result: string, err: any) => {
            if (err) {
                resolve(new Date().toISOString().split('T')[0]);
                return;
            }
            resolve(result);
        });
    });
}

/**
 * Fetch soil moisture from NASA SMAP L4 Global 3-hourly 9 km (SPL4SMGP)
 * Bands: sm_surface, sm_rootzone (Units: m³/m³)
 */
function fetchSMAPData(
    region: any,
    startDate: string,
    endDate: string
): Promise<{ surfaceMoisture: number; rootZoneMoisture: number }> {
    return new Promise((resolve) => {
        try {
            // NASA SMAP L4 Global 3-hourly 9 km
            const smap = ee.ImageCollection('NASA/SMAP/SPL4SMGP/008')
                .filterBounds(region)
                .filterDate(startDate, endDate)
                .select(['sm_surface', 'sm_rootzone']);

            // Get the mean of the period
            const meanImage = smap.mean();

            // Use centroid to ensure we get a value even for small fields (<< 9km)
            const centroid = region.centroid();

            const stats = meanImage.reduceRegion({
                reducer: ee.Reducer.mean(),
                geometry: centroid,
                scale: 9000,
            });

            stats.evaluate((result: any, err: any) => {
                if (err || !result) {
                    console.warn('[EE] SMAP fetch failed or result empty:', err);
                    resolve({ surfaceMoisture: 0, rootZoneMoisture: 0 });
                    return;
                }

                console.log('[EE] SMAP raw result:', result);

                // Convert m³/m³ to Percentage (0-100)
                // Typical range 0.0 - 0.5+ m³/m³, so 0 - 50+%
                const surface = (result.sm_surface ?? 0) * 100;
                const root = (result.sm_rootzone ?? 0) * 100;

                console.log(`[EE] SMAP parsed: Surface=${surface}%, Root=${root}%`);

                resolve({
                    surfaceMoisture: Math.round(surface * 10) / 10,
                    rootZoneMoisture: Math.round(root * 10) / 10
                });
            });
        } catch (err) {
            console.warn('[EE] SMAP error:', err);
            resolve({ surfaceMoisture: 0, rootZoneMoisture: 0 });
        }
    });
}

/**
 * Fetch humidity from ERA5-Land reanalysis data.
 * - Humidity: derived from temperature_2m and dewpoint_temperature_2m
 */
function fetchSoilData(
    region: any,
    startDate: string,
    endDate: string
): Promise<{ soilMoisture: number; humidity: number }> {
    return new Promise((resolve) => {
        try {
            const era5 = ee.ImageCollection('ECMWF/ERA5_LAND/DAILY_AGGR')
                .filterBounds(region)
                .filterDate(startDate, endDate)
                .select(['volumetric_soil_water_layer_1', 'temperature_2m', 'dewpoint_temperature_2m']);

            const latest = era5.mean();

            const stats = latest.reduceRegion({
                reducer: ee.Reducer.mean(),
                geometry: region,
                scale: 11132, // ERA5-Land ~11km resolution
                maxPixels: 1e9,
            });

            stats.evaluate((result: any, err: any) => {
                if (err || !result) {
                    console.warn('[EE] ERA5-Land fetch failed, using defaults:', err);
                    resolve({ soilMoisture: 0, humidity: 0 });
                    return;
                }

                // Soil moisture (Legacy fallback)
                const swl1 = result.volumetric_soil_water_layer_1 ?? 0;
                const soilMoisture = Math.round(swl1 * 100 * 10) / 10;

                // Humidity: Magnus formula
                const tK = result.temperature_2m ?? 273.15;
                const tdK = result.dewpoint_temperature_2m ?? 273.15;
                const tC = tK - 273.15;
                const tdC = tdK - 273.15;

                const rh = 100 * Math.exp((17.625 * tdC) / (243.04 + tdC))
                    / Math.exp((17.625 * tC) / (243.04 + tC));
                const humidity = Math.round(Math.min(100, Math.max(0, rh)) * 10) / 10;

                resolve({ soilMoisture, humidity });
            });
        } catch (err) {
            console.warn('[EE] ERA5-Land error:', err);
            resolve({ soilMoisture: 0, humidity: 0 });
        }
    });
}
