import { db } from "@/src/db";
import { workoutSets } from "@/src/db/schema";
import { NextResponse, NextRequest } from "next/server";
import { eq, and, InferInsertModel } from "drizzle-orm";

export const dynamic = "force-dynamic";

function getWorkspaceId(request: NextRequest): number | null {
  const header = request.headers.get("x-workspace-id");
  if (!header) return null;
  const id = Number(header);
  return Number.isNaN(id) ? null : id;
}

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

    const workspaceId = getWorkspaceId(request);

    const result = workspaceId !== null
      ? await db
          .select()
          .from(workoutSets)
          .where(
            and(
              eq(workoutSets.exerciseId, exerciseId),
              eq(workoutSets.workspaceId, workspaceId)
            )
          )
      : await db
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

export async function POST(request: NextRequest) {
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

    if (!exerciseId) {
      return NextResponse.json(
        { error: "exerciseId is required" },
        { status: 400 }
      );
    }

    const workspaceId = getWorkspaceId(request);

    const createData: InferInsertModel<typeof workoutSets> = {
      exerciseId,
      workspaceId: workspaceId ?? null,
    };
    if (setNumber !== undefined) createData.setNumber = setNumber;
    if (weightKg !== undefined) createData.weightKg = weightKg;
    if (reps !== undefined) createData.reps = reps;
    if (isChecked !== undefined) createData.isChecked = isChecked;

    const createWorkout = await db
      .insert(workoutSets)
      .values(createData)
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
