import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { programExercises, programs, exercises } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const idParam = (await params).id;
    const id = Number(idParam);
    const result = await db
      .select()
      .from(programs)
      .leftJoin(programExercises, eq(programs.id, programExercises.programId))
      .leftJoin(exercises, eq(exercises.id, programExercises.exerciseId))
      .where(eq(programs.id, id));

    const grouped = new Map();

    for (const row of result) {
      const programId = row.programs.id;
      if (!grouped.has(programId)) {
        grouped.set(programId, { ...row.programs, exercises: [] });
      }
      if (row.exercises) {
        grouped.get(programId).exercises.push(row.exercises);
      }
    }

    const data = Array.from(grouped.values());

    if (data.length === 0) {
      return NextResponse.json(
        { error: `Program ${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(data[0]);
  } catch {
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
