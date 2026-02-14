import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { getWeather } from "@/lib/data";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    const weather = await getWeather();
    
    let message = "No actions needed today.";
    
    // Logic: If it's going to be very hot, suggest early morning irrigation
    if (weather.temp > 85) {
      const taskData = {
        title: "🔥 High Temp Alert: Extra Irrigation",
        description: "Forecast shows high temperatures. Extra watering needed for moisture retention.",
        date: new Date().toISOString().split('T')[0],
        startTime: "06:00",
        endTime: "08:00",
        duration: "2 hrs",
        status: "Pending",
        type: "Water",
        priority: "High",
        userId: userId,
      };
      
      await addDoc(collection(db, "tasks"), taskData);
      message = "Automatic irrigation task scheduled due to high heat.";
    }

    // Logic: If rain is expected (wind speed or high humidity simulation)
    if (weather.humidity > 80) {
      const taskData = {
        title: "🌧 Rain Prep: Greenhouse Check",
        description: "High humidity detected. Ensure greenhouse vents are secured.",
        date: new Date().toISOString().split('T')[0],
        startTime: "16:00",
        endTime: "17:00",
        duration: "1 hr",
        status: "Pending",
        type: "Maintenance",
        priority: "Medium",
        userId: userId,
      };
      await addDoc(collection(db, "tasks"), taskData);
      message = "Humidity alert: Maintenance task created.";
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Auto-schedule error:", error);
    return NextResponse.json({ error: "Failed to auto-schedule" }, { status: 500 });
  }
}
