import { db } from "@/src/db";
import { exercises } from "@/src/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allExercises = await db.select().from(exercises);
    return NextResponse.json(allExercises);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch exercises" },
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
    const { name, category } = body;

    if (!name || !category) {
      return NextResponse.json(
        { error: "name and category are required" },
        { status: 400 }
      );
    }

    type NewExercise = typeof exercises.$inferInsert;

    const newExercise: NewExercise = {
      name: name.trim().toUpperCase(),
      category: category.trim().toUpperCase(),
    };

    const newPost = await db.insert(exercises).values(newExercise).returning();

    return NextResponse.json(
      { message: "Exercise created successfully", data: newPost },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
