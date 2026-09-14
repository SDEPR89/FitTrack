import { db } from "@/src/db";
import { exercises } from "@/src/db/schema";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const allExercises = await db.select().from(exercises);
  return NextResponse.json(allExercises);
}
