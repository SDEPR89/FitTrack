import { NextResponse, NextRequest } from "next/server";
import { db } from "@/src/db";
import { workoutSets } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
        { status: 400 },
      );
    }
    const { setNumber, weightKg, reps, isChecked } = body;
    const updateData: Partial<InferInsertModel<typeof workoutSets>> = {};
    if (setNumber !== undefined) updateData.setNumber = setNumber;
    if (weightKg !== undefined) updateData.weightKg = weightKg;
    if (reps !== undefined) updateData.reps = reps;
    if (isChecked !== undefined) updateData.isChecked = isChecked;
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields provided to update" },
        { status: 400 },
      );
    }

    const updatedWorkout = await db
      .update(workoutSets)
      .set(updateData)
      .where(eq(workoutSets.id, id))
      .returning();

    return NextResponse.json(updatedWorkout[0], { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update resource" },
      { status: 500 },
    );
  }
}
