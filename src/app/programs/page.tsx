"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "../../components/Header";
import { BottomNav } from "../../components/BottomNav";
import { Toast } from "../../components/Toast";
import { useWorkspace, wsHeader } from "../../hooks/useWorkspace";

interface ProgramItem {
  id: number;
  name: string;
  programTypeId?: number;
  programTypeName?: string;
}

interface ProgramTypeItem {
  id: number;
  name: string;
}

export default function ProgramLibraryPage() {
  const { id: workspaceId, isLoading: wsLoading } = useWorkspace();
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [programTypes, setProgramTypes] = useState<ProgramTypeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newProgramName, setNewProgramName] = useState<string>("");
  const [selectedTypeId, setSelectedTypeId] = useState<number | "">("");
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Toast feedback
  const [toastMsg, setToastMsg] = useState<string>("");
  const [toastType, setToastType] = useState<"error" | "warning" | "info" | "success">("error");

  useEffect(() => {
    if (wsLoading) return;
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const [progsRes, typesRes] = await Promise.all([
          fetch("/api/programs", { headers: wsHeader(workspaceId) }),
          fetch("/api/programTypes"),
        ]);

        if (progsRes.ok) {
          const progsData = await progsRes.json();
          if (isMounted && Array.isArray(progsData)) {
            setPrograms(progsData);
          }
        }
        if (typesRes.ok) {
          const typesData = await typesRes.json();
          if (isMounted && Array.isArray(typesData)) {
            setProgramTypes(typesData);
            if (typesData.length > 0) {
              setSelectedTypeId(typesData[0].id);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load program data:", err);
        if (isMounted) {
          setToastMsg("Network error loading programs");
          setToastType("error");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [wsLoading, workspaceId]);

  const refetchPrograms = async () => {
    try {
      const res = await fetch("/api/programs", { headers: wsHeader(workspaceId) });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setPrograms(data);
        }
      }
    } catch (err) {
      console.error("Failed to refetch programs:", err);
    }
  };

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgramName.trim() || !selectedTypeId) return;

    try {
      setIsCreating(true);
      setToastMsg("");
      const res = await fetch("/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...wsHeader(workspaceId) },
        body: JSON.stringify({
          name: newProgramName.trim(),
          programTypeId: Number(selectedTypeId),
        }),
      });

      if (res.ok) {
        setNewProgramName("");
        await refetchPrograms();
        setToastMsg("Program created successfully!");
        setToastType("success");
      } else {
        const errorData = await res.json().catch(() => ({}));
        setToastMsg(errorData.error || "Failed to create program");
        setToastType("error");
      }
    } catch (err) {
      console.error("Error creating program:", err);
      setToastMsg("Network error creating program");
      setToastType("error");
    } finally {
      setIsCreating(false);
    }
  };

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDeleteProgram = async (e: React.MouseEvent, prog: ProgramItem) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setDeletingId(prog.id);
      setToastMsg("");
      const res = await fetch(`/api/programs/${prog.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPrograms((prev) => prev.filter((p) => p.id !== prog.id));
        setToastMsg(`Program "${prog.name}" deleted successfully!`);
        setToastType("success");
      } else {
        const data = await res.json().catch(() => ({}));
        setToastMsg(data.error || "Failed to delete program");
        setToastType("error");
      }
    } catch (err) {
      console.error("Error deleting program:", err);
      setToastMsg("Network error deleting program");
      setToastType("error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Header title="Program Library" />
      <main className="flex flex-col relative w-full pt-20 pb-24 bg-transparent min-h-screen text-[var(--custom-a30)]">
        <div className="flex flex-col w-full max-w-[840px] mx-auto px-4 py-4 gap-6">
          {/* Toast Notification */}
          {toastMsg && (
            <Toast
              message={toastMsg}
              type={toastType}
              onDismiss={() => setToastMsg("")}
            />
          )}

          {/* Title & Descriptor */}
          <section className="flex flex-col">
            <h1 className="text-2xl font-bold text-[var(--custom-a30)] tracking-tight">
              Program Library
            </h1>
            <p className="text-xs text-[var(--custom-a20)] mt-1">
              Create new workout routines or select an existing program below.
            </p>
          </section>

          {/* Program Rows List */}
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-[var(--custom-a20)] text-xs font-medium">
              <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"></span>
              <span>Loading programs...</span>
            </div>
          ) : programs.length > 0 ? (
            <section className="flex flex-col gap-3">
              {programs.map((prog) => (
                <Link
                  key={prog.id}
                  href={`/programs/${prog.id}`}
                  className="w-full h-16 rounded-2xl glass-panel px-4 flex items-center justify-between group neu-outset transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--custom-a40)]/20 text-[var(--custom-a40)] flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-[20px]">
                        fitness_center
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-bold text-[var(--custom-a30)] group-hover:text-[var(--custom-a40)] transition-colors">
                        {prog.name}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-[var(--custom-a40)] uppercase tracking-wider">
                        {prog.programTypeName ||
                          programTypes.find((t) => t.id === prog.programTypeId)?.name ||
                          "ROUTINE"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={deletingId === prog.id}
                      aria-label={`Delete ${prog.name}`}
                      onClick={(e) => handleDeleteProgram(e, prog)}
                      className="w-9 h-9 rounded-xl neu-outset text-[var(--custom-a20)] hover:text-rose-400 active:scale-90 transition-all cursor-pointer shrink-0 flex items-center justify-center disabled:opacity-60"
                    >
                      {deletingId === prog.id ? (
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"></span>
                      ) : (
                        <span className="material-symbols-outlined text-[18px]">
                          delete
                        </span>
                      )}
                    </button>
                    <span className="material-symbols-outlined text-[var(--custom-a20)] group-hover:text-white text-[18px] transition-transform group-hover:translate-x-0.5">
                      arrow_forward_ios
                    </span>
                  </div>
                </Link>
              ))}
            </section>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl glass-panel border border-white/10">
              <span className="material-symbols-outlined text-[28px] text-[var(--custom-a20)] mb-1">
                fitness_center
              </span>
              <span className="text-sm font-bold text-[var(--custom-a30)]">
                No Programs Yet
              </span>
              <p className="text-xs text-[var(--custom-a20)] mt-1">
                Create your first routine below.
              </p>
            </div>
          )}

          {/* Create New Program Card Form */}
          <section className="w-full rounded-3xl glass-panel p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[var(--custom-a40)]/20 text-[var(--custom-a40)] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[16px]">
                    add_task
                  </span>
                </div>
                <h2 className="text-sm font-bold text-[var(--custom-a30)]">
                  Create New Program
                </h2>
              </div>
              <span className="font-mono text-[10px] font-bold text-[var(--custom-a40)] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--custom-a40)]/15 border border-[var(--custom-a40)]/30">
                Routine Setup
              </span>
            </div>

            <form
              onSubmit={handleCreateProgram}
              className="flex flex-col gap-4"
            >
              {/* Program Name Input */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="program-name-input"
                  className="text-xs font-semibold text-[var(--custom-a20)]"
                >
                  Program Name
                </label>
                <input
                  id="program-name-input"
                  type="text"
                  required
                  placeholder="e.g. Full Body Conditioning"
                  value={newProgramName}
                  onChange={(e) => setNewProgramName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-2xl neu-inset text-sm text-[var(--custom-a30)] placeholder:text-[var(--custom-a20)]/50 focus:outline-none focus:border-[var(--custom-a40)]/60 transition-all"
                />
              </div>

              {/* Program Type Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="program-type-select"
                  className="text-xs font-semibold text-[var(--custom-a20)]"
                >
                  Program Type
                </label>
                <div className="relative flex items-center group">
                  <select
                    id="program-type-select"
                    value={selectedTypeId}
                    onChange={(e) => setSelectedTypeId(Number(e.target.value))}
                    className="w-full h-11 pl-3.5 pr-10 rounded-2xl neu-inset text-xs font-mono font-bold uppercase tracking-wider text-[var(--custom-a30)] group-hover:border-[var(--custom-a40)]/40 focus:outline-none focus:border-[var(--custom-a40)]/60 appearance-none transition-all cursor-pointer"
                  >
                    {programTypes.map((t) => (
                      <option
                        key={t.id}
                        value={t.id}
                        className="bg-[var(--custom-a0)] text-[var(--custom-a30)] font-mono font-bold py-2"
                      >
                        {t.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-3 text-[var(--custom-a20)] group-hover:text-[var(--custom-a40)] text-[18px] transition-colors">
                    unfold_more
                  </span>
                </div>
              </div>

              {/* Create Program Button */}
              <button
                type="submit"
                disabled={isCreating}
                className="w-full h-11 rounded-2xl bg-[var(--custom-a40)] hover:opacity-95 text-[var(--custom-a0)] font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-60 mt-1"
              >
                {isCreating ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"></span>
                    <span>Creating Program...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">
                      add_circle
                    </span>
                    <span>Create Program</span>
                  </>
                )}
              </button>
            </form>
          </section>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
