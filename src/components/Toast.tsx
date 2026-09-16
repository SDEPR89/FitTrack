"use client";

import React from "react";

interface ToastProps {
  message: string;
  type?: "error" | "warning" | "info" | "success";
  onDismiss?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = "error",
  onDismiss,
}) => {
  if (!message) return null;

  let bgStyles = "bg-rose-950/90 border-rose-800/80 text-rose-200 shadow-md";
  let iconName = "error_outline";

  if (type === "success") {
    bgStyles = "bg-emerald-950/90 border-emerald-800/80 text-emerald-200 shadow-md";
    iconName = "check_circle";
  } else if (type === "info") {
    bgStyles = "bg-teal-950/90 border-teal-800/80 text-teal-200 shadow-md";
    iconName = "info";
  } else if (type === "warning") {
    bgStyles = "bg-amber-950/90 border-amber-800/80 text-amber-200 shadow-md";
    iconName = "warning";
  }

  return (
    <div
      role="alert"
      className={`w-full p-3.5 rounded-2xl border flex items-start gap-3 backdrop-blur-md transition-all duration-200 ${bgStyles}`}
    >
      <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">
        {iconName}
      </span>
      <div className="flex-1 text-xs font-medium leading-relaxed">
        {message}
      </div>
      {onDismiss && (
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={onDismiss}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      )}
    </div>
  );
};
