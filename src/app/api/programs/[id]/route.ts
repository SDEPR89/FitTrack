import { NextResponse, NextRequest } from "next/server";
import { db } from "@/src/db";
import { programExercises, programs, exercises, workoutSets } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";

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

    const result = await db
      .select()
      .from(programs)
      .leftJoin(programExercises, eq(programs.id, programExercises.programId))
      .leftJoin(exercises, eq(exercises.id, programExercises.exerciseId))
      .leftJoin(workoutSets, eq(exercises.id, workoutSets.exerciseId))
      .where(
        workspaceId
          ? and(eq(programs.id, id), eq(workoutSets.workspaceId, workspaceId))
          : eq(programs.id, id)
      );

    const grouped = new Map();

    for (const row of result) {
      const programId = row.programs.id;
      if (!grouped.has(programId)) {
        grouped.set(programId, { ...row.programs, exercises: new Map() });
      }

      if (row.exercises) {
        const exId = row.exercises.id;
        const programData = grouped.get(programId);
        if (!programData.exercises.has(exId)) {
          programData.exercises.set(exId, { ...row.exercises, sets: [] });
        }
        if (row.workout_sets) {
          programData.exercises.get(exId).sets.push(row.workout_sets);
        }
      }
    }

    const programMap = grouped.get(Number(idParam));

    if (!programMap) {
      return NextResponse.json(
        { error: `Program ${id} not found` },
        { status: 404 }
      );
    }

    const finalData = {
      ...programMap,
      exercises: Array.from(programMap.exercises.values()),
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
