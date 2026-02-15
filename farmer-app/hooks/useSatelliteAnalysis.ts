import { useState, useEffect, useCallback } from 'react';
import { Field, EarthEngineAnalysis } from '@/lib/types';

export function useSatelliteAnalysis(field: Field) {
    const [analysis, setAnalysis] = useState<EarthEngineAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchAnalysis = useCallback(async () => {
        // Only fetch if we have valid coordinates
        if (!field.coordinates || field.coordinates.length < 3) return;

        setLoading(true);
        try {
            const res = await fetch('/api/earth-engine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coordinates: field.coordinates }),
            });

            if (!res.ok) throw new Error('Failed to fetch satellite data');

            const data = await res.json();
            setAnalysis(data);
            setError(null);
        } catch (err) {
            setError(err as Error);
            console.error(`[Satellite] Error fetching for field ${field.id}:`, err);
        } finally {
            setLoading(false);
        }
    }, [field.coordinates, field.id]);

    useEffect(() => {
        fetchAnalysis();
        // Refresh every 5 minutes to stay current
        const interval = setInterval(fetchAnalysis, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchAnalysis]);

    return { analysis, loading, error };
}
