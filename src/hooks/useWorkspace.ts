"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "fittrack_workspace";

interface WorkspaceState {
  id: number | null;
  code: string | null;
  isLoading: boolean;
}

interface WorkspaceData {
  id: number;
  code: string;
}

export interface UseWorkspaceReturn extends WorkspaceState {
  switchWorkspace: (code: string) => Promise<boolean>;
}

export function useWorkspace(): UseWorkspaceReturn {
  const [state, setState] = useState<WorkspaceState>({
    id: null,
    code: null,
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed: WorkspaceData = JSON.parse(stored);
          if (parsed.id && parsed.code) {
            if (!cancelled) setState({ id: parsed.id, code: parsed.code, isLoading: false });
            return;
          }
        } catch {
          // Corrupt — fall through
        }
      }

      // No stored workspace — default to DEFAULT001 so existing data is visible
      try {
        const res = await fetch("/api/workspace", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: "DEFAULT001" }),
        });
        if (res.ok) {
          const data: WorkspaceData = await res.json();
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          if (!cancelled) setState({ id: data.id, code: data.code, isLoading: false });
        } else {
          if (!cancelled) setState((s) => ({ ...s, isLoading: false }));
        }
      } catch {
        if (!cancelled) setState((s) => ({ ...s, isLoading: false }));
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  async function switchWorkspace(code: string): Promise<boolean> {
    try {
      const res = await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });
      if (!res.ok) return false;
      const data: WorkspaceData = await res.json();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setState({ id: data.id, code: data.code, isLoading: false });
      return true;
    } catch {
      return false;
    }
  }

  return { ...state, switchWorkspace };
}

// Helper — build the x-workspace-id header from an id.
// Use this inline in fetch calls, e.g.: wsHeader(id)
export function wsHeader(id: number | null): Record<string, string> {
  if (id === null) return {};
  return { "x-workspace-id": String(id) };
}
