import { db } from "@/src/db";
import { workoutSets } from "@/src/db/schema";
import { NextResponse, NextRequest } from "next/server";
import { eq, InferInsertModel } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const exerciseIdParam = request.nextUrl.searchParams.get("exerciseId");
    if (exerciseIdParam === null) {
      return NextResponse.json(
        { error: "exerciseId is required" },
        { status: 400 }
      );
    }
    const exerciseId = Number(exerciseIdParam);
    if (Number.isNaN(exerciseId)) {
      return NextResponse.json(
        { error: "exerciseId must be number" },
        { status: 400 }
      );
    }
    const result = await db
      .select()
      .from(workoutSets)
      .where(eq(workoutSets.exerciseId, exerciseId));
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Request body is missing or not valid JSON" },
        { status: 400 }
      );
    }

    const { setNumber, exerciseId, weightKg, reps, isChecked } = body;
    const createData: Partial<InferInsertModel<typeof workoutSets>> = {};
    if (setNumber !== undefined) createData.setNumber = setNumber;
    if (weightKg !== undefined) createData.weightKg = weightKg;
    if (reps !== undefined) updateDataReps(createData, reps);
    if (isChecked !== undefined) createData.isChecked = isChecked;

    if (!exerciseId) {
      return NextResponse.json(
        { error: "exerciseId is required" },
        { status: 400 }
      );
    }
    createData.exerciseId = exerciseId;

    const createWorkout = await db
      .insert(workoutSets)
      .values(createData as InferInsertModel<typeof workoutSets>)
      .returning();

    return NextResponse.json(
      { message: "Workout set created successfully", data: createWorkout },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

function updateDataReps(createData: Partial<InferInsertModel<typeof workoutSets>>, reps: number) {
  createData.reps = reps;
}
