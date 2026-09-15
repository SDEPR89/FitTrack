import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { exercises } from "@/src/db/schema";
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
      .from(exercises)
      .where(eq(exercises.id, id));

    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update resource" },
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

    const deleteExercise = await db
      .delete(exercises)
      .where(eq(exercises.id, id))
      .returning();

    if (deleteExercise.length === 0) {
      return NextResponse.json(
        { error: `Exercise ${id} not found` },
        { status: 404 },
      );
    }

    return NextResponse.json({ deleteExercise }, { status: 200 });
  } catch (error) {

    if (
      typeof error === "object" &&
      error !== null &&
      "cause" in error &&
      typeof error.cause === "object" &&
      error.cause !== null &&
      "code" in error.cause &&
      error.cause.code === "23503"
    ) {
      return NextResponse.json(
        {
          error:
            "Cannot delete this exercise because it has existing workout sets logged against it.",
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to delete the item" },
      { status: 500 },
    );
  }
}
