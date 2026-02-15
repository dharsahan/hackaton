import { NextRequest, NextResponse } from 'next/server';
import { analyzeFieldNDVI, FieldCoordinate } from '@/lib/earthEngine';

// Mock data for fallback
const mockNDVI = {
    tileUrl: "", // No tile for mock
    ndviStats: {
        mean: 0.65,
        min: 0.2,
        max: 0.85
    },
    soilMoisture: 35, // %
    humidity: 62, // %
    timestamp: new Date().toISOString().split('T')[0],
    satellite: 'Simulated Data'
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { coordinates, startDate, endDate } = body as {
            coordinates: FieldCoordinate[];
            startDate?: string;
            endDate?: string;
        };

        if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 3) {
            return NextResponse.json(
                { error: 'At least 3 coordinates are required to define a field polygon.' },
                { status: 400 }
            );
        }

        const invalidCoord = coordinates.find(
            c => typeof c.lon !== 'number' || typeof c.lat !== 'number'
        );
        if (invalidCoord) {
            return NextResponse.json(
                { error: 'Each coordinate must have numeric lon and lat properties.' },
                { status: 400 }
            );
        }

        const result = await analyzeFieldNDVI(coordinates, startDate, endDate);
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('[Earth Engine API Error]', error);

        // Fallback to mock data on ANY error to keep UI functional
        if (error.message?.includes('GEE_SERVICE_ACCOUNT') || error.message?.includes('EE initialization failed')) {
            console.log('[EE] Returning mock data due to configuration error');
            return NextResponse.json({
                ...mockNDVI,
                satellite: 'Simulated (Config Error)'
            });
        }

        console.log('[EE] Returning mock data due to processing error');
        return NextResponse.json({
            ...mockNDVI,
            satellite: 'Simulated (Error)'
        });
    }
}
