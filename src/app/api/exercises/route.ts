import { db } from "@/src/db";
import { exercises } from "@/src/db/schema";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const names = await db.select().from(exercises);
  return NextResponse.json(names);
}
