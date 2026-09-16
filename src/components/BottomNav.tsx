"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const isScheduleActive = pathname === "/" || pathname === "/schedule";
  const isProgramActive = pathname.startsWith("/program");
  const isExercisesActive = pathname.startsWith("/exercises");

  return (
    <nav className="fixed bottom-0 w-full z-40 pb-safe bg-[var(--custom-a0)]/70 backdrop-blur-xl border-t border-white/10 shadow-lg">
      <div className="h-16 max-w-[640px] mx-auto px-gutter flex items-center justify-around">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center min-w-[64px] h-12 rounded-xl transition-all cursor-pointer ${
            isScheduleActive
              ? "text-[var(--custom-a40)] font-semibold"
              : "text-[var(--custom-a20)]/70 hover:text-white"
          }`}
          aria-current={isScheduleActive ? "page" : undefined}
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: isScheduleActive ? "'FILL' 1" : "'FILL' 0" }}
          >
            calendar_today
          </span>
          <span className="text-[11px] font-medium mt-1">Schedule</span>
        </Link>

        <Link
          href="/programs"
          className={`flex flex-col items-center justify-center min-w-[64px] h-12 rounded-xl transition-all cursor-pointer ${
            isProgramActive
              ? "text-[var(--custom-a40)] font-semibold"
              : "text-[var(--custom-a20)]/70 hover:text-white"
          }`}
          aria-current={isProgramActive ? "page" : undefined}
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: isProgramActive ? "'FILL' 1" : "'FILL' 0" }}
          >
            format_list_bulleted
          </span>
          <span className="text-[11px] font-medium mt-1">Programs</span>
        </Link>

        <Link
          href="/exercises"
          className={`flex flex-col items-center justify-center min-w-[64px] h-12 rounded-xl transition-all cursor-pointer ${
            isExercisesActive
              ? "text-[var(--custom-a40)] font-semibold"
              : "text-[var(--custom-a20)]/70 hover:text-white"
          }`}
          aria-current={isExercisesActive ? "page" : undefined}
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: isExercisesActive ? "'FILL' 1" : "'FILL' 0" }}
          >
            tune
          </span>
          <span className="text-[11px] font-medium mt-1">Exercises</span>
        </Link>
      </div>
    </nav>
  );
};
