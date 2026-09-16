import { db } from "@/src/db";
import { programs } from "@/src/db/schema";
import { NextResponse, NextRequest } from "next/server";
import { InferInsertModel } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const allPrograms = await db.select().from(programs);
    return NextResponse.json(allPrograms);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch programs" },
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
    const { name, programTypeId } = body;
    const createData: Partial<InferInsertModel<typeof programs>> = {};
    if (name !== undefined) createData.name = name;

    if (!name || !programTypeId) {
      return NextResponse.json(
        { error: "name and programTypeId are required" },
        { status: 400 },
      );
    }

    createData.programTypeId = programTypeId;

    const createWorkout = await db
      .insert(programs)
      .values(createData as InferInsertModel<typeof programs>)
      .returning();

    return NextResponse.json(
      { message: "Post created successfully", data: createWorkout },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
