import { useState, useEffect, useCallback } from 'react';
import { Field } from '@/lib/types';

export interface WeatherData {
    temp: number;
    condition: string;
    description: string;
    humidity: number;
    windSpeed: number;
    icon: string;
}

export function useFieldWeather(field: Field) {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchWeather = useCallback(async () => {
        // Use the first coordinate point as the location for weather
        if (!field.coordinates || field.coordinates.length === 0) return;
        const location = field.coordinates[0];

        setLoading(true);
        try {
            const res = await fetch('/api/weather', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat: location.lat, lon: location.lon }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                // Don't throw if key is missing, just set error state smoothly
                throw new Error(errorData.error || 'Weather data unavailable');
            }

            const data = await res.json();
            setWeather({
                temp: Math.round(data.main.temp),
                condition: data.weather[0].main,
                description: data.weather[0].description,
                humidity: data.main.humidity,
                windSpeed: Math.round(data.wind.speed * 2.237), // m/s to mph
                icon: data.weather[0].icon,
            });
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [field.coordinates]);

    useEffect(() => {
        fetchWeather();
        // Refresh every 30 minutes
        const interval = setInterval(fetchWeather, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchWeather]);

    return { weather, loading, error };
}
