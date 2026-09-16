"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "../../components/Header";
import { BottomNav } from "../../components/BottomNav";
import { Toast } from "../../components/Toast";

interface ExerciseItem {
  id: string | number;
  name: string;
  category: string;
  logsCount?: number;
}

const DEFAULT_CATEGORIES = [
  "Chest",
  "Back",
  "Shoulders",
  "Legs",
  "Hamstrings",
  "Arms",
  "Abs",
];

function normalizeCategoryName(cat: string): string {
  if (!cat) return "";
  return cat.trim().toUpperCase();
}

function matchCategory(
  exerciseCat: string = "",
  selectedCat: string = "",
): boolean {
  if (!selectedCat || selectedCat.toLowerCase() === "all") return true;

  const ex = exerciseCat.trim().toLowerCase();
  const sel = selectedCat.trim().toLowerCase();

  if (ex === sel) return true;
  if (ex + "s" === sel || sel + "s" === ex) return true;
  if (ex.replace(/s$/, "") === sel.replace(/s$/, "")) return true;

  return false;
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [newName, setNewName] = useState<string>("");
  const [newCategory, setNewCategory] = useState<string>("");

  // Feedback Toast & In-flight states
  const [toastMsg, setToastMsg] = useState<string>("");
  const [toastType, setToastType] = useState<"error" | "warning" | "info">(
    "error",
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  // Dynamically compute filter category buttons based on categories in the exercises database table
  const databaseCategories = React.useMemo(() => {
    const list: string[] = [];

    exercises.forEach((ex) => {
      if (ex.category) {
        const normalized = normalizeCategoryName(ex.category);
        const exists = list.some((item) => matchCategory(item, normalized));
        if (!exists) {
          list.push(normalized);
        }
      }
    });

    return list;
  }, [exercises]);

  const fetchExercises = useCallback(async () => {
    try {
      const res = await fetch("/api/exercises");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setExercises(data);
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setToastMsg(errData.error || "Failed to load exercise database");
        setToastType("error");
      }
    } catch (err) {
      console.error("Failed to fetch exercises from API:", err);
      setToastMsg("Network error loading exercise database");
      setToastType("error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const res = await fetch("/api/exercises");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data)) {
            setExercises(data);
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          if (isMounted) {
            setToastMsg(errData.error || "Failed to load exercise database");
            setToastType("error");
          }
        }
      } catch (err) {
        console.error("Failed to fetch exercises from API:", err);
        if (isMounted) {
          setToastMsg("Network error loading exercise database");
          setToastType("error");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCategory.trim()) return;

    try {
      setIsSaving(true);
      setToastMsg("");
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim().toUpperCase(),
          category: newCategory.trim().toUpperCase(),
        }),
      });

      if (res.ok) {
        setNewName("");
        setNewCategory("");
        await fetchExercises();
      } else {
        const errorData = await res.json().catch(() => ({}));
        setToastMsg(errorData.error || "Failed to add exercise");
        setToastType("error");
      }
    } catch (err) {
      console.error("Error creating exercise:", err);
      setToastMsg("Network error creating exercise");
      setToastType("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExercise = async (item: ExerciseItem) => {
    try {
      setDeletingId(item.id);
      setToastMsg("");
      const res = await fetch(`/api/exercises/${item.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setExercises((prev) => prev.filter((ex) => ex.id !== item.id));
      } else if (res.status === 409) {
        const data = await res.json().catch(() => ({}));
        setToastMsg(
          data.error ||
            "Can't delete — this exercise has logged workouts. Archive or reassign historical logs first.",
        );
        setToastType("warning");
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setToastMsg(data.error || "Failed to delete exercise");
        setToastType("error");
      }
    } catch (err) {
      console.error("Error deleting exercise:", err);
      setToastMsg("Network error deleting exercise");
      setToastType("error");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredExercises = exercises.filter((ex) => {
    const matchesCategory = matchCategory(ex.category, selectedCategory);
    const matchesSearch =
      !searchQuery.trim() ||
      ex.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
    return matchesCategory && matchesSearch;
  });

  const filterCategories = ["All", ...databaseCategories];

  return (
    <>
      <Header title="Exercise Library" />
      <main className="flex flex-col relative w-full pt-16 pb-24 bg-transparent min-h-screen text-[var(--custom-a30)]">
        <div className="flex flex-col w-full max-w-[840px] mx-auto px-4 py-4 gap-6">
          {/* Deletion Constraint / Error Notification Toast */}
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
              Exercise Library
            </h1>
            <p className="text-xs text-[var(--custom-a20)] mt-1">
              Manage custom exercises, muscle group targets, and database
              entries.
            </p>
          </section>

          {/* Search & Filter Section */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--custom-a20)]">
                Filter Library
              </span>
              <span className="font-mono text-xs text-[var(--custom-a40)] font-bold">
                {filteredExercises.length}{" "}
                {filteredExercises.length === 1 ? "exercise" : "exercises"}
              </span>
            </div>

            {/* Search Input */}
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-[var(--custom-a20)] text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search exercise name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-3.5 rounded-2xl neu-inset text-sm text-[var(--custom-a30)] placeholder:text-[var(--custom-a20)]/50 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 text-[var(--custom-a20)] hover:text-white"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    close
                  </span>
                </button>
              )}
            </div>

            {/* Category Filter Pills (Synced with Categories DB) */}
            <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
              {filterCategories.map((cat) => {
                const isActive =
                  cat === "All"
                    ? selectedCategory === "All"
                    : matchCategory(cat, selectedCategory);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`shrink-0 h-9 px-3.5 rounded-xl font-mono text-xs font-bold tracking-wider transition-all cursor-pointer flex items-center ${
                      isActive
                        ? "neu-inset text-[var(--custom-a40)] border border-[var(--custom-a40)]/50 scale-105"
                        : "neu-outset text-[var(--custom-a20)] hover:text-white"
                    }`}
                  >
                    {cat.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </section>

          {/* List of Exercises */}
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-[var(--custom-a20)] text-xs font-medium">
              <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"></span>
              <span>Loading exercise library...</span>
            </div>
          ) : filteredExercises.length > 0 ? (
            <section className="flex flex-col gap-2.5">
              {filteredExercises.map((exercise) => (
                <article
                  key={exercise.id}
                  className="w-full min-h-[56px] rounded-2xl glass-panel px-4 py-3 flex items-center justify-between gap-3 transition-all"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-[var(--custom-a30)] truncate">
                      {exercise.name}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      {/* UPPERCASE CATEGORY BADGE */}
                      <span className="font-mono text-[10px] font-bold text-[var(--custom-a40)] bg-[var(--custom-a40)]/15 px-2 py-0.5 rounded-full border border-[var(--custom-a40)]/30">
                        {exercise.category
                          ? exercise.category.toUpperCase()
                          : "GENERAL"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={deletingId === exercise.id}
                    aria-label={`Delete ${exercise.name}`}
                    onClick={() => handleDeleteExercise(exercise)}
                    className="w-9 h-9 rounded-xl neu-outset text-[var(--custom-a20)] hover:text-rose-400 active:scale-90 transition-all cursor-pointer shrink-0 flex items-center justify-center disabled:opacity-60"
                  >
                    {deletingId === exercise.id ? (
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"></span>
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">
                        delete
                      </span>
                    )}
                  </button>
                </article>
              ))}
            </section>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center rounded-3xl glass-panel">
              <span className="material-symbols-outlined text-[28px] text-[var(--custom-a20)] mb-1">
                fitness_center
              </span>
              <span className="text-sm font-bold text-[var(--custom-a30)]">
                No Exercises Found
              </span>
              <p className="text-xs text-[var(--custom-a20)] mt-1 max-w-[260px]">
                No entries matching category &quot;
                {selectedCategory.toUpperCase()}&quot; in database.
              </p>
            </div>
          )}

          {/* Add New Exercise Card Form */}
          <section className="w-full rounded-3xl glass-panel p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[var(--custom-a40)]/20 text-[var(--custom-a40)] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[16px]">
                    post_add
                  </span>
                </div>
                <h2 className="text-sm font-bold text-[var(--custom-a30)]">
                  Add New Exercise
                </h2>
              </div>
              <span className="font-mono text-[10px] font-bold text-[var(--custom-a40)] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--custom-a40)]/15 border border-[var(--custom-a40)]/30">
                Database Entry
              </span>
            </div>

            <form onSubmit={handleAddExercise} className="flex flex-col gap-4">
              {/* Exercise Name Input */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="exercise-name-input"
                  className="text-xs font-semibold text-[var(--custom-a20)]"
                >
                  Exercise Name
                </label>
                <input
                  id="exercise-name-input"
                  type="text"
                  required
                  placeholder="e.g. ROMANIAN DEADLIFT"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value.toUpperCase())}
                  className="w-full h-11 px-3.5 rounded-2xl neu-inset text-sm font-mono font-bold uppercase text-[var(--custom-a30)] placeholder:text-[var(--custom-a20)]/50 placeholder:font-sans placeholder:font-normal focus:outline-none focus:border-[var(--custom-a40)]/60 transition-all"
                />
              </div>

              {/* Target Muscle Group Input (Typeable) */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="exercise-category-input"
                  className="text-xs font-semibold text-[var(--custom-a20)]"
                >
                  Target Muscle Group
                </label>
                <input
                  id="exercise-category-input"
                  type="text"
                  required
                  placeholder="e.g. CHEST, LEGS, ARMS"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value.toUpperCase())}
                  className="w-full h-11 px-3.5 rounded-2xl neu-inset text-sm font-mono font-bold uppercase text-[var(--custom-a30)] placeholder:text-[var(--custom-a20)]/50 placeholder:font-sans placeholder:font-normal focus:outline-none focus:border-[var(--custom-a40)]/60 transition-all"
                />
              </div>

              {/* Save Exercise Button with loading spinner */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full h-11 rounded-2xl bg-[var(--custom-a40)] hover:opacity-95 text-[var(--custom-a0)] font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-60 mt-1"
              >
                {isSaving ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"></span>
                    <span>Saving Exercise...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">
                      add_circle
                    </span>
                    <span>Save Exercise</span>
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
