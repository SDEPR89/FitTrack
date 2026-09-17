import { db } from "@/src/db";
import { programTypes } from "@/src/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const types = await db.select().from(programTypes);
    return NextResponse.json(types);
  } catch (error) {
    console.error("Failed to fetch program types:", error);
    return NextResponse.json(
      { error: "Failed to fetch program types" },
      { status: 500 }
    );
  }
}
