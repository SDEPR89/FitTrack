import { db } from "@/src/db";
import { workoutSets } from "@/src/db/schema";
import { NextResponse, NextRequest } from "next/server";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const exerciseIdParam = request.nextUrl.searchParams.get("exerciseId");
  if (exerciseIdParam === null) {
    return NextResponse.json(
      { error: "exerciseId is required" },
      { status: 400 },
    );
  }
  const exerciseId = Number(exerciseIdParam);
  if (Number.isNaN(exerciseId)) {
    return NextResponse.json(
      { error: "exerciseId must be number" },
      { status: 400 },
    );
  }
  const result = await db
    .select()
    .from(workoutSets)
    .where(eq(workoutSets.exerciseId, exerciseId));
  return NextResponse.json(result);
}
