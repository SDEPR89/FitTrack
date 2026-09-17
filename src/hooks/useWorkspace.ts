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

// Returns workspace state and a function to switch workspace by code.
// workspaceHeaders() returns a headers object to spread into fetch() calls.
export function useWorkspace(): WorkspaceState & {
  switchWorkspace: (code: string) => Promise<boolean>;
  workspaceHeaders: () => Record<string, string>;
} {
  const [state, setState] = useState<WorkspaceState>({
    id: null,
    code: null,
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function init() {
      // Check localStorage first
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed: WorkspaceData = JSON.parse(stored);
          if (parsed.id && parsed.code) {
            if (!cancelled) {
              setState({ id: parsed.id, code: parsed.code, isLoading: false });
            }
            return;
          }
        } catch {
          // Corrupt stored value — fall through to create new
        }
      }

      // Create a new workspace
      try {
        const res = await fetch("/api/workspace", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        if (res.ok) {
          const data: WorkspaceData = await res.json();
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          if (!cancelled) {
            setState({ id: data.id, code: data.code, isLoading: false });
          }
        } else {
          if (!cancelled) setState((s) => ({ ...s, isLoading: false }));
        }
      } catch {
        if (!cancelled) setState((s) => ({ ...s, isLoading: false }));
      }
    }

    init();
    return () => {
      cancelled = true;
    };
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

  function workspaceHeaders(): Record<string, string> {
    if (state.id === null) return {};
    return { "x-workspace-id": String(state.id) };
  }

  return { ...state, switchWorkspace, workspaceHeaders };
}
