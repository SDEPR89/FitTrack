import { NextResponse, NextRequest } from "next/server";
import { db } from "@/src/db";
import { programExercises, programs, exercises, workoutSets } from "@/src/db/schema";
import { eq, and, inArray } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const idParam = (await params).id;
    const id = Number(idParam);
    const workspaceId = request.headers.get("x-workspace-id")
      ? Number(request.headers.get("x-workspace-id"))
      : null;

    // 1. Fetch the program details
    const programResult = await db
      .select()
      .from(programs)
      .where(eq(programs.id, id));

    const program = programResult[0];
    if (!program) {
      return NextResponse.json(
        { error: `Program ${id} not found` },
        { status: 404 }
      );
    }

    // 2. Fetch exercises associated with this program
    const programExs = await db
      .select({
        exerciseId: programExercises.exerciseId,
      })
      .from(programExercises)
      .where(eq(programExercises.programId, id));

    const exerciseIds = programExs.map((pe) => pe.exerciseId);
    if (exerciseIds.length === 0) {
      return NextResponse.json({
        ...program,
        exercises: [],
      });
    }

    // 3. Fetch exercise details
    const exercisesList = await db
      .select()
      .from(exercises)
      .where(inArray(exercises.id, exerciseIds));

    // 4. Fetch all workout sets for these exercises
    // Filter by workspaceId if provided
    const allSets = await db
      .select()
      .from(workoutSets)
      .where(
        workspaceId
          ? and(inArray(workoutSets.exerciseId, exerciseIds), eq(workoutSets.workspaceId, workspaceId))
          : inArray(workoutSets.exerciseId, exerciseIds)
      );

    // 5. Assemble the nested structure
    const exercisesMap = new Map();
    for (const ex of exercisesList) {
      exercisesMap.set(ex.id, { ...ex, sets: [] });
    }

    for (const set of allSets) {
      const ex = exercisesMap.get(set.exerciseId);
      if (ex) {
        ex.sets.push(set);
      }
    }

    const finalData = {
      ...program,
      exercises: Array.from(exercisesMap.values()),
    };

    return NextResponse.json(finalData);
  } catch (error) {
    console.error("Failed to fetch program details:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const idParam = (await params).id;
    const programId = Number(idParam);
    const body = await request.json();
    const { exerciseId } = body;

    if (!exerciseId) {
      return NextResponse.json(
        { error: "exerciseId is required" },
        { status: 400 }
      );
    }

    const inserted = await db
      .insert(programExercises)
      .values({ programId, exerciseId: Number(exerciseId) })
      .returning();

    return NextResponse.json({ success: true, data: inserted[0] }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to add exercise to program" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const idParam = (await params).id;
    const programId = Number(idParam);
    const { searchParams } = new URL(request.url);
    const exerciseIdParam = searchParams.get("exerciseId");

    if (exerciseIdParam) {
      const exerciseId = Number(exerciseIdParam);
      const deleted = await db
        .delete(programExercises)
        .where(
          and(
            eq(programExercises.programId, programId),
            eq(programExercises.exerciseId, exerciseId)
          )
        )
        .returning();

      return NextResponse.json(
        { success: true, message: "Exercise removed from program", data: deleted },
        { status: 200 }
      );
    }

    const deleteProgram = await db
      .delete(programs)
      .where(eq(programs.id, programId))
      .returning();

    if (deleteProgram.length === 0) {
      return NextResponse.json(
        { error: `Program ${programId} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ deleteProgram }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete program/exercise:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
