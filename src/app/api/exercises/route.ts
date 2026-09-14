import { db } from "@/src/db";
import { exercises } from "@/src/db/schema";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const allExercises = await db.select().from(exercises);
    return NextResponse.json(allExercises);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update resource" },
      { status: 500 },
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
        { status: 400 },
      );
    }
    const { name, category } = body;

    if (!name || !category) {
      return NextResponse.json(
        { error: "name and category are required" },
        { status: 400 },
      );
    }
    type NewExercise = typeof exercises.$inferInsert;

    const newExercise: NewExercise = {
      name,
      category,
    };
    if (Object.keys(newExercise).length === 0) {
      return NextResponse.json(
        { error: "No fields provided to update" },
        { status: 400 },
      );
    }
    const newPost = await db.insert(exercises).values(newExercise).returning();

    return NextResponse.json(
      { message: "Post created successfully", data: newPost },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
