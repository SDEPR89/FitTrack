import { db } from "@/src/db";
import { workspaces } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// POST /api/workspace — create new or look up existing workspace by code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const code: string | undefined = body?.code;

    if (code) {
      // Look up existing workspace by code
      const normalized = String(code).trim().toUpperCase();
      const found = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.code, normalized));

      if (found.length === 0) {
        return NextResponse.json(
          { error: `Workspace "${normalized}" not found` },
          { status: 404 }
        );
      }
      return NextResponse.json({ id: found[0].id, code: found[0].code });
    }

    // Create a new unique workspace
    let attempts = 0;
    while (attempts < 10) {
      const newCode = generateCode();
      try {
        const inserted = await db
          .insert(workspaces)
          .values({ code: newCode })
          .returning();
        return NextResponse.json(
          { id: inserted[0].id, code: inserted[0].code },
          { status: 201 }
        );
      } catch {
        // Unique constraint collision — retry
        attempts++;
      }
    }

    return NextResponse.json(
      { error: "Failed to generate a unique workspace code" },
      { status: 500 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
