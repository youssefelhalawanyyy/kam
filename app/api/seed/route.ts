import { NextResponse } from "next/server";
import { seedFirestore } from "@/lib/seedData";

export async function POST() {
  try {
    await seedFirestore();
    return NextResponse.json({ success: true, message: "Firestore seeded!" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "POST to this endpoint to seed Firestore" });
}
