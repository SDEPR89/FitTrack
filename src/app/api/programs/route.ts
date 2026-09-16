import { db } from "@/src/db";
import { programs } from "@/src/db/schema";
import { NextResponse, NextRequest } from "next/server";

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
