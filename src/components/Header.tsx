"use client";

import React from "react";
import Link from "next/link";

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title = "FitTrack" }) => {
  return (
    <header className="fixed top-0 w-full z-40 pt-safe bg-[var(--custom-a0)]/70 backdrop-blur-xl border-b border-white/10 shadow-md">
      <div className="h-14 px-gutter flex items-center justify-between max-w-[840px] mx-auto">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-[var(--custom-a40)] text-[var(--custom-a0)] flex items-center justify-center shadow-xs group-hover:opacity-95 transition-opacity">
            <span className="material-symbols-outlined text-[18px]">
              fitness_center
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-[var(--custom-a30)] text-base tracking-tight">
              FitTrack
            </span>
            <span className="text-[var(--custom-a20)]/60 text-xs font-normal">/</span>
            <span className="text-[var(--custom-a20)] text-xs font-medium">
              {title}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
};
