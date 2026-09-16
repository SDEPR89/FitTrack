import { NextResponse, NextRequest } from "next/server";
import { db } from "@/src/db";
import { programExercises, programs, exercises } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
        { status: 404 },
      );
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch data" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const idParam = (await params).id;
    const id = Number(idParam);

    const deleteProgram = await db
      .delete(programs)
      .where(eq(programs.id, id))
      .returning();

    if (deleteProgram.length === 0) {
      return NextResponse.json(
        { error: `Program ${id} not found` },
        { status: 404 },
      );
    }

    return NextResponse.json({ deleteProgram }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete the item" },
      { status: 500 },
    );
  }
}
