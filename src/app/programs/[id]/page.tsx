"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "../../../components/Header";
import { BottomNav } from "../../../components/BottomNav";
import { Toast } from "../../../components/Toast";
import { useWorkspace, wsHeader } from "../../../hooks/useWorkspace";

interface SetData {
  id: number;
  setNumber: number;
  weightKg: string;
  reps: number;
  isChecked: boolean;
}

function formatMuscleCategory(cat: string[] | string | undefined | null): string {
  if (!cat) return "GENERAL";
  if (Array.isArray(cat)) return cat.join(", ").toUpperCase();
  if (typeof cat === "string") return cat.toUpperCase();
  return "GENERAL";
}

interface ExerciseData {
  id: number;
  name: string;
  category: string[] | string;
  sets: SetData[];
  addingSet?: boolean;
}

interface ProgramDetail {
  id: number;
  name: string;
  programTypeId?: number;
  exercises: ExerciseData[];
}

export default function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const programId = Number(resolvedParams.id);
  const { id: workspaceId } = useWorkspace();

  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string>("");

  // Add Exercise Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [availableExercises, setAvailableExercises] = useState<
    Array<{ id: number; name: string; category: string[] | string }>
  >([]);
  const [loadingAvailable, setLoadingAvailable] = useState<boolean>(false);
  const [addingExerciseId, setAddingExerciseId] = useState<number | null>(null);

  // Fetch program detail and workout sets for each exercise
  const loadProgramDetail = useCallback(
    async (showLoadingState: boolean = true) => {
      if (isNaN(programId)) return;
      try {
        if (showLoadingState) setLoading(true);
        const res = await fetch(`/api/programs/${programId}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setToastMessage(errData.error || "Program not found");
          return;
        }

        const progData = await res.json();
        setProgram({
          id: progData.id,
          name: progData.name,
          programTypeId: progData.programTypeId,
          exercises: progData.exercises || [],
        });

        if (Array.isArray(progData.exercises)) {
          const exercisesWithSets = await Promise.all(
            progData.exercises.map(
              async (ex: { id: number; name: string; category: string }) => {
                let sets: SetData[] = [];
                try {
                  const setsRes = await fetch(
                    `/api/workoutSets?exerciseId=${ex.id}`,
                    { headers: wsHeader(workspaceId) },
                  );
                  if (setsRes.ok) {
                    const rawSets = await setsRes.json();
                    if (Array.isArray(rawSets)) {
                      sets = rawSets.map((s) => ({
                        id: s.id,
                        setNumber: s.setNumber || 1,
                        weightKg:
                          s.weightKg !== null && s.weightKg !== undefined
                            ? String(s.weightKg)
                            : "0",
                        reps: s.reps || 0,
                        isChecked: Boolean(s.isChecked),
                      }));
                    }
                  }
                } catch (e) {
                  console.error(`Error loading sets for exercise ${ex.id}:`, e);
                }
                return {
                  id: ex.id,
                  name: ex.name,
                  category: ex.category,
                  sets,
                };
              },
            ),
          );
          setExercises(exercisesWithSets);
        }
      } catch (err) {
        console.error("Error loading program detail:", err);
        setToastMessage("Failed to load program details");
      } finally {
        setLoading(false);
      }
    },
    [programId, workspaceId],
  );

  useEffect(() => {
    let isMounted = true;

    async function fetchProgramDetail() {
      try {
        setLoading(true);
        const res = await fetch(`/api/programs/${programId}`);
        if (!res.ok) {
          throw new Error("Failed to load program");
        }
        const data = await res.json();
        if (isMounted && data && data.id) {
          setProgram({
            id: data.id,
            name: data.name,
            programTypeId: data.programTypeId,
            exercises: data.exercises || [],
          });
          const rawExercises: ExerciseData[] = data.exercises || [];
          const exercisesWithSets = await Promise.all(
            rawExercises.map(async (ex) => {
              const setsRes = await fetch(
                `/api/workoutSets?exerciseId=${ex.id}`,
                { headers: wsHeader(workspaceId) },
              );
              const setsData = setsRes.ok ? await setsRes.json() : [];
              return {
                ...ex,
                sets: Array.isArray(setsData) ? setsData : [],
              };
            }),
          );
          setExercises(exercisesWithSets);
        }
      } catch (err) {
        console.error("Error loading program detail:", err);
        if (isMounted) {
          setToastMessage("Failed to load program details");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProgramDetail();

    return () => {
      isMounted = false;
    };
  }, [programId]);

  // Handle "Add workout" set creation for an exercise
  const handleAddWorkoutSet = async (exerciseId: number) => {
    try {
      setExercises((prev) =>
        prev.map((ex) =>
          ex.id === exerciseId ? { ...ex, addingSet: true } : ex,
        ),
      );

      const targetEx = exercises.find((ex) => ex.id === exerciseId);
      const nextSetNumber = (targetEx?.sets.length || 0) + 1;
      const defaultWeight = "0.00";
      const defaultReps = 0;

      const res = await fetch("/api/workoutSets", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...wsHeader(workspaceId) },
        body: JSON.stringify({
          exerciseId,
          setNumber: nextSetNumber,
          weightKg: defaultWeight,
          reps: defaultReps,
          isChecked: false,
        }),
      });

      if (res.ok) {
        const resData = await res.json();
        const createdSet = Array.isArray(resData.data)
          ? resData.data[0]
          : resData.data;

        const fallbackId = exerciseId * 1000 + nextSetNumber;
        const newSet: SetData = {
          id: createdSet?.id ?? fallbackId,
          setNumber: createdSet?.setNumber || nextSetNumber,
          weightKg:
            createdSet?.weightKg !== undefined && createdSet?.weightKg !== null
              ? String(createdSet.weightKg)
              : defaultWeight,
          reps: createdSet?.reps || defaultReps,
          isChecked: Boolean(createdSet?.isChecked),
        };

        setExercises((prev) =>
          prev.map((ex) =>
            ex.id === exerciseId
              ? { ...ex, sets: [...ex.sets, newSet], addingSet: false }
              : ex,
          ),
        );
      } else {
        const errData = await res.json().catch(() => ({}));
        setToastMessage(errData.error || "Failed to add workout set");
      }
    } catch (err) {
      console.error("Error creating workout set:", err);
      setToastMessage("Failed to add workout set");
    } finally {
      setExercises((prev) =>
        prev.map((ex) =>
          ex.id === exerciseId ? { ...ex, addingSet: false } : ex,
        ),
      );
    }
  };

  // Independent field update helpers (PATCH /api/workoutSets/[id])
  const patchSetField = async (
    setId: number,
    fieldPayload: Partial<{
      setNumber: number;
      weightKg: string;
      reps: number;
      isChecked: boolean;
    }>,
  ) => {
    try {
      const res = await fetch(`/api/workoutSets/${setId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fieldPayload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setToastMessage(errData.error || "Failed to update set");
      }
    } catch (err) {
      console.error("Error patching set:", err);
      setToastMessage("Network error updating set");
    }
  };

  const handleToggleChecked = (exerciseId: number, setId: number) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => {
            if (s.id !== setId) return s;
            const nextChecked = !s.isChecked;
            patchSetField(setId, { isChecked: nextChecked });
            return { ...s, isChecked: nextChecked };
          }),
        };
      }),
    );
  };

  const handleWeightChange = (
    exerciseId: number,
    setId: number,
    val: string,
  ) => {
    let cleanVal = val;
    if (
      cleanVal.length > 1 &&
      cleanVal.startsWith("0") &&
      !cleanVal.startsWith("0.")
    ) {
      cleanVal = cleanVal.replace(/^0+/, "");
    }
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) =>
            s.id === setId ? { ...s, weightKg: cleanVal } : s,
          ),
        };
      }),
    );
  };

  const handleWeightBlur = (setId: number, val: string) => {
    const formatted = val === "" ? "0" : String(parseFloat(val) || 0);
    patchSetField(setId, { weightKg: formatted });
  };

  const handleRepsChange = (
    exerciseId: number,
    setId: number,
    rawVal: string,
  ) => {
    let cleanVal = rawVal;
    if (cleanVal.length > 1 && cleanVal.startsWith("0")) {
      cleanVal = cleanVal.replace(/^0+/, "");
    }
    const safeReps = Math.max(0, parseInt(cleanVal, 10) || 0);
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) =>
            s.id === setId ? { ...s, reps: safeReps } : s,
          ),
        };
      }),
    );
  };

  const handleRepsBlur = (setId: number, val: number) => {
    const safeReps = Math.max(0, val || 0);
    patchSetField(setId, { reps: safeReps });
  };

  const handleDeleteSet = async (exerciseId: number, setId: number) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.filter((s) => s.id !== setId),
        };
      }),
    );
    try {
      await fetch(`/api/workoutSets/${setId}`, { method: "DELETE" });
    } catch (err) {
      console.error("Error deleting set:", err);
    }
  };

  // Add Exercise to Program Modal
  const handleOpenAddExerciseModal = async () => {
    setIsAddModalOpen(true);
    try {
      setLoadingAvailable(true);
      const res = await fetch("/api/exercises");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setAvailableExercises(data);
        }
      }
    } catch (err) {
      console.error("Failed to load available exercises:", err);
    } finally {
      setLoadingAvailable(false);
    }
  };

  const handleAddExerciseToProgram = async (exId: number) => {
    try {
      setAddingExerciseId(exId);
      const res = await fetch(`/api/programs/${programId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseId: exId }),
      });
      if (res.ok) {
        await loadProgramDetail();
        setIsAddModalOpen(false);
      } else {
        const errData = await res.json().catch(() => ({}));
        setToastMessage(errData.error || "Failed to add exercise to program");
      }
    } catch (err) {
      console.error("Error adding exercise to program:", err);
      setToastMessage("Network error adding exercise");
    } finally {
      setAddingExerciseId(null);
    }
  };

  const handleRemoveExerciseFromProgram = async (exId: number) => {
    try {
      const res = await fetch(`/api/programs/${programId}?exerciseId=${exId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setExercises((prev) => prev.filter((ex) => ex.id !== exId));
      } else {
        const errData = await res.json().catch(() => ({}));
        setToastMessage(errData.error || "Failed to remove exercise");
      }
    } catch (err) {
      console.error("Error removing exercise:", err);
      setToastMessage("Network error removing exercise");
    }
  };

  const router = useRouter();
  const [isDeletingProgram, setIsDeletingProgram] = useState(false);

  const handleDeleteProgram = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${program?.name || "this program"}"?`,
      )
    ) {
      return;
    }
    try {
      setIsDeletingProgram(true);
      const res = await fetch(`/api/programs/${programId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/programs");
      } else {
        const errData = await res.json().catch(() => ({}));
        setToastMessage(errData.error || "Failed to delete program");
      }
    } catch (err) {
      console.error("Error deleting program:", err);
      setToastMessage("Network error deleting program");
    } finally {
      setIsDeletingProgram(false);
    }
  };

  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSets = exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.isChecked).length,
    0,
  );
  const progressPercent =
    totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  return (
    <>
      <Header title={program?.name || "Program Detail"} />
      <main className="flex flex-col relative w-full pt-20 pb-24 bg-transparent min-h-screen text-[var(--custom-a30)]">
        <div className="flex flex-col w-full max-w-[840px] mx-auto px-4 py-4 gap-6">
          {/* Toast Notification */}
          {toastMessage && (
            <Toast
              message={toastMessage}
              type="error"
              onDismiss={() => setToastMessage("")}
            />
          )}

          {/* Top Bar with Back Link & Action Buttons */}
          <div className="flex items-center justify-between">
            <Link
              href="/programs"
              className="w-10 h-10 rounded-xl neu-outset flex items-center justify-center text-[var(--custom-a20)] hover:text-white transition-all cursor-pointer"
              aria-label="Back to programs"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_back
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isDeletingProgram}
                onClick={handleDeleteProgram}
                className="h-10 px-3 rounded-xl neu-outset text-[var(--custom-a20)] hover:text-rose-400 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                aria-label="Delete Program"
              >
                {isDeletingProgram ? (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"></span>
                ) : (
                  <span className="material-symbols-outlined text-[16px]">
                    delete
                  </span>
                )}
                <span className="hidden sm:inline">Delete Program</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAddExerciseModal}
                className="h-10 px-3.5 rounded-xl bg-[var(--custom-a40)] hover:opacity-95 text-[var(--custom-a0)] font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  add
                </span>
                <span>Add Exercise</span>
              </button>
            </div>
          </div>

          {/* Program Header */}
          <section className="flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <h1 className="text-2xl font-bold text-[var(--custom-a30)] tracking-tight">
                {program?.name || "Program Routine"}
              </h1>
              <span className="text-xs font-mono text-[var(--custom-a20)] font-medium">
                {exercises.length} Exercises · {completedSets}/{totalSets} Sets
                Completed ({progressPercent}%)
              </span>
            </div>

            {/* Micro Progress Bar */}
            <div className="w-full h-2 rounded-full neu-inset overflow-hidden">
              <div
                className="h-full bg-[var(--custom-a40)] rounded-full transition-all duration-300 shadow-xs"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </section>

          {/* Exercise Cards List */}
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-[var(--custom-a20)] text-xs font-medium">
              <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"></span>
              <span>Loading routine details...</span>
            </div>
          ) : exercises.length > 0 ? (
            <div className="flex flex-col gap-5">
              {exercises.map((exercise) => (
                <article
                  key={exercise.id}
                  className="flex flex-col gap-4 p-5 rounded-3xl glass-panel"
                >
                  {/* Exercise Header */}
                  <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <h2 className="text-base font-bold text-[var(--custom-a30)] truncate">
                        {exercise.name}
                      </h2>
                      {/* UPPERCASE CATEGORY BADGE */}
                      <span className="font-mono text-[10px] font-bold text-[var(--custom-a40)] bg-[var(--custom-a40)]/20 px-2.5 py-0.5 rounded-full border border-[var(--custom-a40)]/40 shrink-0">
                        {formatMuscleCategory(exercise.category)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={exercise.addingSet}
                        onClick={() => handleAddWorkoutSet(exercise.id)}
                        className="h-9 px-3 rounded-xl neu-outset text-[var(--custom-a40)] font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                      >
                        {exercise.addingSet ? (
                          <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"></span>
                        ) : (
                          <span className="material-symbols-outlined text-[16px]">
                            add
                          </span>
                        )}
                        <span>Add workout</span>
                      </button>

                      <button
                        type="button"
                        aria-label={`Remove ${exercise.name} from program`}
                        onClick={() =>
                          handleRemoveExerciseFromProgram(exercise.id)
                        }
                        className="w-9 h-9 rounded-xl neu-outset text-[var(--custom-a20)] hover:text-rose-400 transition-all flex items-center justify-center cursor-pointer shrink-0"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Workout Set Rows */}
                  {exercise.sets.length > 0 ? (
                    <div className="flex flex-col gap-2.5">
                      {exercise.sets.map((set) => (
                        <div
                          key={set.id}
                          className={`set-row flex items-center justify-between p-3 rounded-2xl transition-all ${
                            set.isChecked ? "neu-inset" : "neu-outset"
                          }`}
                        >
                          {/* Tactile Checkbox Control */}
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              aria-label={`Mark set ${set.setNumber} ${
                                set.isChecked ? "incomplete" : "complete"
                              }`}
                              onClick={() =>
                                handleToggleChecked(exercise.id, set.id)
                              }
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
                              className={`text-xs font-semibold ${
                                set.isChecked
                                  ? "text-[var(--custom-a20)] line-through"
                                  : "text-[var(--custom-a30)]"
                              }`}
                            >
                              Set {set.setNumber}
                            </span>
                          </div>

                          {/* Independent Weight & Reps Inputs */}
                          <div className="flex items-center gap-2">
                            {/* Editable Weight Input */}
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-white/5">
                              <span className="text-[10px] font-mono text-[var(--custom-a20)] font-semibold uppercase">
                                kg
                              </span>
                              <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={set.weightKg}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) =>
                                  handleWeightChange(
                                    exercise.id,
                                    set.id,
                                    e.target.value,
                                  )
                                }
                                onBlur={(e) =>
                                  handleWeightBlur(set.id, e.target.value)
                                }
                                className="w-14 h-7 bg-transparent text-center font-mono text-sm font-bold text-[var(--custom-a30)] outline-none focus:text-[var(--custom-a40)]"
                              />
                            </div>

                            {/* Editable Reps Input */}
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-white/5">
                              <span className="text-[10px] font-mono text-[var(--custom-a20)] font-semibold uppercase">
                                reps
                              </span>
                              <input
                                type="number"
                                min="0"
                                value={set.reps}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) =>
                                  handleRepsChange(
                                    exercise.id,
                                    set.id,
                                    e.target.value,
                                  )
                                }
                                onBlur={(e) =>
                                  handleRepsBlur(
                                    set.id,
                                    parseInt(e.target.value, 10) || 0,
                                  )
                                }
                                className="w-12 h-7 bg-transparent text-center font-mono text-sm font-bold text-[var(--custom-a30)] outline-none focus:text-[var(--custom-a40)]"
                              />
                            </div>

                            {/* Delete Set Button */}
                            <button
                              type="button"
                              aria-label={`Delete set ${set.setNumber}`}
                              onClick={() =>
                                handleDeleteSet(exercise.id, set.id)
                              }
                              className="w-8 h-8 rounded-xl neu-outset text-[var(--custom-a20)] hover:text-rose-400 transition-all cursor-pointer shrink-0 flex items-center justify-center"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                delete
                              </span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center text-xs text-[var(--custom-a20)] font-medium">
                      No sets logged yet. Tap &quot;Add workout&quot; to begin.
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center rounded-3xl glass-panel">
              <span className="material-symbols-outlined text-[28px] text-[var(--custom-a20)] mb-1">
                fitness_center
              </span>
              <span className="text-sm font-bold text-[var(--custom-a30)]">
                No Exercises In Routine
              </span>
              <p className="text-xs text-[var(--custom-a20)] mt-1">
                Tap below to add exercises from your library.
              </p>
              <button
                type="button"
                onClick={handleOpenAddExerciseModal}
                className="mt-4 h-10 px-4 rounded-xl bg-[var(--custom-a40)] text-[var(--custom-a0)] font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  add
                </span>
                <span>Add Exercise to Program</span>
              </button>
            </div>
          )}
        </div>

        {/* Add Exercise Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[var(--custom-a0)] border border-white/10 p-5 rounded-3xl flex flex-col gap-4 max-h-[80vh] shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-[var(--custom-a30)]">
                  Add Exercise to Program
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-8 h-8 rounded-xl neu-outset flex items-center justify-center text-[var(--custom-a20)] hover:text-white transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    close
                  </span>
                </button>
              </div>

              <div className="flex flex-col gap-2 overflow-y-auto max-h-[50vh] pr-1 no-scrollbar">
                {loadingAvailable ? (
                  <div className="flex items-center justify-center gap-2 py-6 text-xs text-[var(--custom-a20)] font-medium">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"></span>
                    <span>Loading available exercises...</span>
                  </div>
                ) : availableExercises.length > 0 ? (
                  availableExercises.map((ex) => {
                    const isAlreadyAdded = exercises.some(
                      (e) => e.id === ex.id,
                    );
                    return (
                      <div
                        key={ex.id}
                        className="flex items-center justify-between p-3 rounded-2xl neu-outset"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[var(--custom-a30)]">
                            {ex.name}
                          </span>
                          <span className="font-mono text-[10px] font-bold text-[var(--custom-a40)] mt-0.5">
                            {formatMuscleCategory(ex.category)}
                          </span>
                        </div>
                        <button
                          type="button"
                          disabled={
                            isAlreadyAdded || addingExerciseId === ex.id
                          }
                          onClick={() => handleAddExerciseToProgram(ex.id)}
                          className={`h-8 px-3 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                            isAlreadyAdded
                              ? "neu-inset text-[var(--custom-a20)] cursor-not-allowed opacity-60"
                              : "bg-[var(--custom-a40)] text-[var(--custom-a0)] hover:opacity-95 shadow-xs"
                          }`}
                        >
                          {addingExerciseId === ex.id ? (
                            <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"></span>
                          ) : isAlreadyAdded ? (
                            <span>Added</span>
                          ) : (
                            <span>Add</span>
                          )}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-xs text-[var(--custom-a20)]">
                    No exercises found in database.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
