"use client";

import React, { memo } from "react";

interface SetData {
  id: number;
  setNumber: number;
  weightKg: string;
  reps: number;
  isChecked: boolean;
}

interface SetRowProps {
  set: SetData;
  exerciseId: number;
  onToggleChecked: (exerciseId: number, setId: number) => void;
  onWeightChange: (exerciseId: number, setId: number, val: string) => void;
  onWeightBlur: (setId: number, val: string) => void;
  onRepsChange: (exerciseId: number, setId: number, rawVal: string) => void;
  onRepsBlur: (setId: number, val: number) => void;
  onDeleteSet: (exerciseId: number, setId: number) => void;
}

export const SetRow = memo(({
  set,
  exerciseId,
  onToggleChecked,
  onWeightChange,
  onWeightBlur,
  onRepsChange,
  onRepsBlur,
  onDeleteSet
}: SetRowProps) => {
  return (
    <div
      className={`set-row grid grid-cols-[2.35rem_3rem_minmax(0,1fr)_minmax(0,0.82fr)_2rem] items-center gap-1.5 p-3 rounded-2xl transition-all sm:grid-cols-[2.5rem_3.25rem_minmax(7rem,1fr)_minmax(6.25rem,0.85fr)_2.25rem] sm:gap-2 ${
        set.isChecked ? "neu-inset" : "neu-outset"
      }`}
    >
      <button
        type="button"
        aria-label={`Mark set ${set.setNumber} ${
          set.isChecked ? "incomplete" : "complete"
        }`}
        onClick={() => onToggleChecked(exerciseId, set.id)}
        className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer tactile-checkbox ${
          set.isChecked
            ? "tactile-checkbox-checked"
            : "neu-outset text-transparent hover:text-[var(--custom-a20)]/40"
        }`}
      >
        <span className="material-symbols-outlined text-[18px] font-bold">
          check
        </span>
      </button>
      <span
        className={`whitespace-nowrap text-center text-[11px] font-semibold leading-tight ${
          set.isChecked
            ? "text-[var(--custom-a20)] line-through"
            : "text-[var(--custom-a30)]"
        }`}
      >
        Set {set.setNumber}
      </span>

      <div className="flex min-w-0 items-center gap-1 px-2 py-1 rounded-xl bg-black/40 border border-white/5">
        <span className="text-[10px] font-mono text-[var(--custom-a20)] font-semibold uppercase">
          kg
        </span>
        <input
          type="number"
          min="0"
          step="0.5"
          value={set.weightKg}
          onFocus={(e) => e.target.select()}
          onChange={(e) => onWeightChange(exerciseId, set.id, e.target.value)}
          onBlur={(e) => onWeightBlur(set.id, e.target.value)}
          className="min-w-0 flex-1 h-7 bg-transparent text-center font-mono text-sm font-bold text-[var(--custom-a30)] outline-none focus:text-[var(--custom-a40)]"
        />
      </div>

      <div className="flex min-w-0 items-center gap-1 px-2 py-1 rounded-xl bg-black/40 border border-white/5">
        <span className="text-[10px] font-mono text-[var(--custom-a20)] font-semibold uppercase">
          reps
        </span>
        <input
          type="number"
          min="0"
          value={set.reps}
          onFocus={(e) => e.target.select()}
          onChange={(e) => onRepsChange(exerciseId, set.id, e.target.value)}
          onBlur={(e) => onRepsBlur(set.id, parseInt(e.target.value, 10) || 0)}
          className="min-w-0 flex-1 h-7 bg-transparent text-center font-mono text-sm font-bold text-[var(--custom-a30)] outline-none focus:text-[var(--custom-a40)]"
        />
      </div>

      <button
        type="button"
        aria-label={`Delete set ${set.setNumber}`}
        onClick={() => onDeleteSet(exerciseId, set.id)}
        className="w-8 h-8 rounded-xl neu-outset text-[var(--custom-a20)] hover:text-rose-400 transition-all cursor-pointer flex items-center justify-center"
      >
        <span className="material-symbols-outlined text-[16px]">
          delete
        </span>
      </button>
    </div>
  );
});

SetRow.displayName = "SetRow";
