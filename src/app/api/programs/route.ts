import { db } from "@/src/db";
import { programs, programTypes, workspaces } from "@/src/db/schema";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { InferInsertModel, eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

function getWorkspaceId(request: NextRequest): number | null {
  const header = request.headers.get("x-workspace-id");
  if (!header) return null;
  const id = Number(header);
  return Number.isNaN(id) ? null : id;
}

export async function GET(request: NextRequest) {
  try {
    const workspaceId = getWorkspaceId(request);

    const query = db
      .select({
        id: programs.id,
        name: programs.name,
        programTypeId: programs.programTypeId,
        programTypeName: programTypes.name,
        workspaceId: programs.workspaceId,
      })
      .from(programs)
      .leftJoin(programTypes, eq(programs.programTypeId, programTypes.id));

    const allPrograms = workspaceId !== null
      ? await query.where(eq(programs.workspaceId, workspaceId))
      : await query;

    return NextResponse.json(allPrograms);
  } catch (error) {
    console.error("Failed to fetch programs:", error);
    return NextResponse.json(
      { error: "Failed to fetch programs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const { name, programTypeId } = body;

    if (!name || !programTypeId) {
      return NextResponse.json(
        { error: "name and programTypeId are required" },
        { status: 400 }
      );
    }

    const workspaceId = getWorkspaceId(request);

    // If a workspaceId header was sent, verify the workspace exists
    if (workspaceId !== null) {
      const ws = await db
        .select({ id: workspaces.id })
        .from(workspaces)
        .where(eq(workspaces.id, workspaceId));
      if (ws.length === 0) {
        return NextResponse.json(
          { error: "Workspace not found" },
          { status: 404 }
        );
      }
    }

    const createData: InferInsertModel<typeof programs> = {
      name: String(name).trim().toUpperCase(),
      programTypeId,
      workspaceId: workspaceId ?? null,
    };

    const createWorkout = await db
      .insert(programs)
      .values(createData)
      .returning();

    return NextResponse.json(
      { message: "Program created successfully", data: createWorkout },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create program:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
