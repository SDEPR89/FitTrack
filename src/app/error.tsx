"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Header } from "../components/Header";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error("FitTrack Runtime Error:", error);
  }, [error]);

  return (
    <>
      <Header title="Error" />
      <main className="flex flex-col items-center justify-center relative w-full pt-20 pb-24 bg-transparent min-h-screen text-[var(--custom-a30)] px-4">
        <div className="flex flex-col items-center justify-center w-full max-w-[520px] p-8 rounded-3xl glass-panel text-center gap-6 shadow-xl">
          {/* Badge & Icon */}
          <div className="flex flex-col items-center gap-3">
            <span className="font-mono text-xs font-bold text-rose-400 uppercase tracking-wider px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30">
              Unexpected Error
            </span>
            <div className="w-20 h-20 rounded-2xl neu-outset flex items-center justify-center text-rose-400">
              <span className="material-symbols-outlined text-[36px]">
                warning
              </span>
            </div>
          </div>

          {/* Heading & Text */}
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--custom-a30)]">
              Something Went Wrong
            </h1>
            <p className="text-xs text-[var(--custom-a20)] max-w-[340px] leading-relaxed">
              An unexpected issue occurred while rendering this page. You can try refreshing or returning to your schedule.
            </p>
          </div>

          {/* Error Message Box */}
          {error.message && (
            <div className="w-full p-3.5 rounded-2xl neu-inset text-left">
              <p className="font-mono text-[11px] text-rose-300/90 break-words">
                {error.message}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:flex-1 h-11 rounded-2xl bg-[var(--custom-a40)] hover:opacity-95 text-[var(--custom-a0)] font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                refresh
              </span>
              <span>Try Again</span>
            </button>
            <Link
              href="/"
              className="w-full sm:flex-1 h-11 rounded-2xl neu-outset text-[var(--custom-a30)] hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                calendar_today
              </span>
              <span>Back to Schedule</span>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
