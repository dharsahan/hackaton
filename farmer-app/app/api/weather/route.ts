import { NextResponse } from 'next/server';

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export async function POST(request: Request) {
    if (!API_KEY || API_KEY === 'YOUR_OPENWEATHER_API_KEY') {
        return NextResponse.json(
            { error: 'OpenWeather API key is not configured' },
            { status: 500 }
        );
    }

    try {
        const { lat, lon } = await request.json();

        if (!lat || !lon) {
            return NextResponse.json(
                { error: 'Latitude and Longitude are required' },
                { status: 400 }
            );
        }

        const url = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const res = await fetch(url);

        if (!res.ok) {
            const errorData = await res.json();
            return NextResponse.json(
                { error: errorData.message || 'Failed to fetch weather data' },
                { status: res.status }
            );
        }

        const data = await res.json();

        // Transform to our Weather interface
        const weather = {
            temp: Math.round(data.main.temp),
            condition: data.weather[0].main,
            description: data.weather[0].description,
            humidity: data.main.humidity,
            windSpeed: Math.round(data.wind.speed * 2.237), // m/s to mph
            icon: data.weather[0].icon,
        };

        return NextResponse.json(weather);
    } catch (error) {
        console.error('Weather API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
