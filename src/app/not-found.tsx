import React from "react";
import Link from "next/link";
import { Header } from "../components/Header";

export default function NotFound() {
  return (
    <>
      <Header title="404 Not Found" />
      <main className="flex flex-col items-center justify-center relative w-full pt-20 pb-24 bg-transparent min-h-screen text-[var(--custom-a30)] px-4">
        <div className="flex flex-col items-center justify-center w-full max-w-[520px] p-8 rounded-3xl glass-panel text-center gap-6 shadow-xl">
          {/* Badge & Icon */}
          <div className="flex flex-col items-center gap-3">
            <span className="font-mono text-xs font-bold text-[var(--custom-a40)] uppercase tracking-wider px-3 py-1 rounded-full bg-[var(--custom-a40)]/15 border border-[var(--custom-a40)]/30">
              Error 404
            </span>
            <div className="w-20 h-20 rounded-2xl neu-outset flex items-center justify-center text-[var(--custom-a40)]">
              <span className="material-symbols-outlined text-[36px]">
                wrong_location
              </span>
            </div>
          </div>

          {/* Heading & Text */}
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--custom-a30)]">
              Page Not Found
            </h1>
            <p className="text-xs text-[var(--custom-a20)] max-w-[340px] leading-relaxed">
              The workout routine or page you are looking for doesn&apos;t exist, has been moved, or is unavailable.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-2">
            <Link
              href="/"
              className="w-full sm:flex-1 h-11 rounded-2xl bg-[var(--custom-a40)] hover:opacity-95 text-[var(--custom-a0)] font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                calendar_today
              </span>
              <span>Back to Schedule</span>
            </Link>
            <Link
              href="/exercises"
              className="w-full sm:flex-1 h-11 rounded-2xl neu-outset text-[var(--custom-a30)] hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                fitness_center
              </span>
              <span>Exercise Library</span>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
