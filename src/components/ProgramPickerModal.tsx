"use client";

import React, { useEffect, useState } from "react";
import { wsHeader } from "@/src/hooks/useWorkspace";

interface ProgramItem {
  id: number;
  name: string;
  programTypeId?: number;
}

interface ProgramPickerModalProps {
  isOpen: boolean;
  dayName: string;
  currentProgram?: string;
  onClose: () => void;
  onSelectProgram: (day: string, program: string, programId?: number) => void;
  workspaceId: number | null;
}

export const ProgramPickerModal: React.FC<ProgramPickerModalProps> = ({
  isOpen,
  dayName,
  currentProgram,
  onClose,
  onSelectProgram,
  workspaceId,
}) => {
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (!isOpen) return;
    async function fetchPrograms() {
      try {
        setLoading(true);
        setErrorMsg("");
        const res = await fetch("/api/programs", { headers: wsHeader(workspaceId) });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setPrograms(data);
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          setErrorMsg(errData.error || "Failed to load routines from server");
        }
      } catch (err) {
        console.error("Failed to fetch programs for picker:", err);
        setErrorMsg("Network error loading routines");
      } finally {
        setLoading(false);
      }
    }
    fetchPrograms();
  }, [isOpen, workspaceId]);

  if (!isOpen) return null;

  const handleSelect = (programName: string, programId?: number) => {
    onSelectProgram(dayName, programName, programId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center px-4 pb-4 sm:items-center">
      <div className="w-full max-w-[480px] bg-[var(--custom-a0)] border border-white/10 rounded-3xl p-5 flex flex-col shadow-2xl transition-all">
        {/* Title Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-[var(--custom-a30)]">
              Assign Routine to {dayName}
            </h2>
            <p className="text-xs text-[var(--custom-a20)] mt-0.5">
              Select a routine from your database
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-9 h-9 rounded-xl neu-outset flex items-center justify-center text-[var(--custom-a20)] hover:text-white cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-3 p-3 rounded-xl bg-rose-950/80 text-rose-200 text-xs border border-rose-800">
            {errorMsg}
          </div>
        )}

        {/* Options List */}
        <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1 no-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-[var(--custom-a20)] text-xs font-medium">
              <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              <span>Loading routines...</span>
            </div>
          ) : programs.length > 0 ? (
            programs.map((prog) => {
              const isSelected = currentProgram === prog.name;
              return (
                <button
                  key={prog.id}
                  type="button"
                  onClick={() => handleSelect(prog.name, prog.id)}
                  className={`w-full min-h-[48px] px-4 rounded-2xl text-sm font-semibold transition-all flex items-center justify-between text-left cursor-pointer ${
                    isSelected
                      ? "neu-inset text-[var(--custom-a40)] border border-[var(--custom-a40)]/50"
                      : "neu-outset text-[var(--custom-a30)]"
                  }`}
                >
                  <span>{prog.name}</span>
                  {isSelected && (
                    <span className="material-symbols-outlined text-[var(--custom-a40)] text-[18px]">
                      check_circle
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="flex flex-col items-center py-6 gap-2 text-center">
              <span className="text-[var(--custom-a20)] text-xs">No routines found in this workspace.</span>
              <span className="text-[var(--custom-a20)]/50 text-[10px]">
                Go to Programs tab to create one, or switch workspace via the key badge.
              </span>
            </div>
          )}

          {/* Clear Assignment Option */}
          <button
            type="button"
            onClick={() => handleSelect("")}
            className="w-full min-h-[44px] px-4 rounded-2xl bg-black/20 hover:bg-black/40 border border-white/5 text-xs font-medium text-[var(--custom-a20)] hover:text-rose-400 transition-all flex items-center gap-2 cursor-pointer mt-1"
          >
            <span className="material-symbols-outlined text-[16px] text-rose-400">
              remove_circle_outline
            </span>
            <span>Clear routine assignment</span>
          </button>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center gap-3 mt-5 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-2xl neu-outset text-xs font-semibold text-[var(--custom-a20)] hover:text-white transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-2xl bg-[var(--custom-a40)] hover:opacity-95 text-[var(--custom-a0)] font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
