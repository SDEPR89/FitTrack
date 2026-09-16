import React from "react";
import { Header } from "../components/Header";

export default function Loading() {
  return (
    <>
      <Header title="Loading" />
      <main className="flex flex-col items-center justify-center relative w-full pt-16 pb-24 bg-transparent min-h-screen text-[var(--custom-a30)] px-4">
        <div className="flex flex-col items-center justify-center w-full max-w-[480px] p-8 rounded-3xl glass-panel text-center gap-6 shadow-xl">
          {/* Animated Neumorphic Icon Container */}
          <div className="relative w-20 h-20 rounded-2xl neu-outset flex items-center justify-center text-[var(--custom-a40)]">
            <span className="material-symbols-outlined text-[36px] animate-pulse">
              fitness_center
            </span>
            <div className="absolute inset-0 rounded-2xl border-2 border-[var(--custom-a40)]/40 animate-ping opacity-25"></div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[var(--custom-a30)]">
              Loading FitTrack...
            </h1>
            <p className="text-xs text-[var(--custom-a20)] max-w-[320px]">
              Synchronizing your workout routines, exercise library, and set
              targets.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
