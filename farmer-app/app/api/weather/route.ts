import { NextResponse } from 'next/server';

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export async function POST(request: Request) {
    // Mock data for demo/fallback (matches OpenWeatherMap structure)
    const mockWeatherResponse = {
        main: {
            temp: 24, // Celsius
            humidity: 45
        },
        weather: [
            {
                main: "Partly Cloudy",
                description: "gentle breeze",
                icon: "02d"
            }
        ],
        wind: {
            speed: 5.36 // m/s (approx 12 mph when converted)
        }
    };

    if (!API_KEY || API_KEY === 'YOUR_OPENWEATHER_API_KEY') {
        // Return mock data instead of error for demo stability
        console.warn("Weather API key missing, returning mock data");
        return NextResponse.json(mockWeatherResponse);
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
            console.warn(`Weather API failed: ${res.statusText}, returning mock data`);
            return NextResponse.json(mockWeatherResponse);
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
        // Fallback to mock on crash
        return NextResponse.json(mockWeatherResponse);
    }
}
