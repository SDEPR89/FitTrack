import { db } from "@/src/db";
import { workspaces } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function getWorkspaceId(request: NextRequest): number | null {
  const header = request.headers.get("x-workspace-id");
  if (!header) return null;
  const id = Number(header);
  return Number.isNaN(id) ? null : id;
}

// GET /api/schedule — return the schedule JSON for the workspace
export async function GET(request: NextRequest) {
  const workspaceId = getWorkspaceId(request);
  if (workspaceId === null) {
    return NextResponse.json({ schedule: null });
  }

  try {
    const rows = await db
      .select({ schedule: workspaces.schedule })
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId));

    if (rows.length === 0) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    return NextResponse.json({ schedule: rows[0].schedule ?? null });
  } catch {
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
  }
}

// PUT /api/schedule — save the schedule JSON for the workspace
export async function PUT(request: NextRequest) {
  const workspaceId = getWorkspaceId(request);
  if (workspaceId === null) {
    return NextResponse.json({ error: "x-workspace-id header required" }, { status: 400 });
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.schedule !== "string") {
      return NextResponse.json({ error: "schedule (string) is required" }, { status: 400 });
    }

    await db
      .update(workspaces)
      .set({ schedule: body.schedule })
      .where(eq(workspaces.id, workspaceId));

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save schedule" }, { status: 500 });
  }
}
