import { NextRequest, NextResponse } from 'next/server';
import { analyzeFieldNDVI, FieldCoordinate } from '@/lib/earthEngine';

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

        if (error.message?.includes('GEE_SERVICE_ACCOUNT')) {
            return NextResponse.json(
                {
                    error: 'Earth Engine not configured',
                    setup: true,
                    message: error.message,
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { error: error.message || 'Failed to analyze field with Earth Engine.' },
            { status: 500 }
        );
    }
}
