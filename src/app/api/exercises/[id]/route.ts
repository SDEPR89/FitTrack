import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { exercises } from "@/src/db/schema";
import { eq, InferInsertModel } from "drizzle-orm";

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
      .from(exercises)
      .where(eq(exercises.id, id));

    if (result.length === 0) {
      return NextResponse.json(
        { error: `Exercise ${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch exercise" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
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
        { status: 404 }
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
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete the item" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const idParam = (await params).id;
    const id = Number(idParam);

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Request body is missing or not valid JSON" },
        { status: 400 }
      );
    }
    const { name, category } = body;
    const updateData: Partial<InferInsertModel<typeof exercises>> = {};
    if (name !== undefined) updateData.name = name.trim().toUpperCase();
    if (category !== undefined) {
      if (Array.isArray(category)) {
        updateData.category = category.map((c) => String(c).trim().toUpperCase()).filter(Boolean);
      } else if (typeof category === "string") {
        updateData.category = category.split(",").map((c) => String(c).trim().toUpperCase()).filter(Boolean);
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields provided to update" },
        { status: 400 }
      );
    }

    const updateExercise = await db
      .update(exercises)
      .set(updateData)
      .where(eq(exercises.id, id))
      .returning();

    return NextResponse.json(updateExercise[0], { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to update resource" },
      { status: 500 }
    );
  }
}