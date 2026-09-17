"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Header } from "../components/Header";
import { BottomNav } from "../components/BottomNav";
import { ProgramPickerModal } from "../components/ProgramPickerModal";
import { useWorkspace, wsHeader } from "../hooks/useWorkspace";

interface DaySchedule {
  day: string;
  code: string;
  program: string;
  programId?: number;
  details: string;
  isToday?: boolean;
}

const CLEAN_SCHEDULE: DaySchedule[] = [
  { day: "Monday", code: "MON", program: "", details: "No program selected", isToday: false },
  { day: "Tuesday", code: "TUE", program: "", details: "No program selected", isToday: false },
  { day: "Wednesday", code: "WED", program: "", details: "No program selected", isToday: false },
  { day: "Thursday", code: "THU", program: "", details: "No program selected", isToday: false },
  { day: "Friday", code: "FRI", program: "", details: "No program selected", isToday: false },
  { day: "Saturday", code: "SAT", program: "", details: "No program selected", isToday: false },
  { day: "Sunday", code: "SUN", program: "", details: "No program selected", isToday: false },
];

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const getTodayDayName = (): string => {
  return DAYS_OF_WEEK[new Date().getDay()];
};

function applyToday(schedule: DaySchedule[]): DaySchedule[] {
  const todayName = getTodayDayName();
  return schedule.map((d) => ({ ...d, isToday: d.day === todayName }));
}

export default function WeeklySchedulePage() {
  const { id: workspaceId, isLoading: wsLoading } = useWorkspace();
  const [schedule, setSchedule] = useState<DaySchedule[]>(applyToday(CLEAN_SCHEDULE));
  const [scheduleLoading, setScheduleLoading] = useState<boolean>(true);
  const [pickerState, setPickerState] = useState<{
    isOpen: boolean;
    dayName: string;
    currentProgram: string;
  }>({ isOpen: false, dayName: "", currentProgram: "" });

  // Load schedule from DB when workspace is ready
  useEffect(() => {
    if (wsLoading) return;
    let cancelled = false;

    async function loadSchedule() {
      setScheduleLoading(true);
      try {
        const res = await fetch("/api/schedule", { headers: wsHeader(workspaceId) });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.schedule) {
            try {
              const parsed = JSON.parse(data.schedule);
              if (Array.isArray(parsed)) {
                setSchedule(applyToday(parsed));
              }
            } catch {
              // Corrupt schedule — keep clean
            }
          }
        }
      } catch {
        // Network error — keep clean schedule
      } finally {
        if (!cancelled) setScheduleLoading(false);
      }
    }

    loadSchedule();
    return () => { cancelled = true; };
  }, [wsLoading, workspaceId]);

  const saveSchedule = useCallback(async (updated: DaySchedule[]) => {
    setSchedule(applyToday(updated));
    try {
      await fetch("/api/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...wsHeader(workspaceId) },
        body: JSON.stringify({ schedule: JSON.stringify(updated) }),
      });
    } catch {
      // Silent — schedule already updated locally
    }
  }, [workspaceId]);

  const openPicker = (dayName: string, currentProgram: string) => {
    setPickerState({ isOpen: true, dayName, currentProgram });
  };

  const closePicker = () => {
    setPickerState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSelectProgram = (dayName: string, newProgram: string, programId?: number) => {
    const updated = schedule.map((item) => {
      if (item.day !== dayName) return item;

      let details = "No program selected";
      if (
        newProgram === "Upper Body A" ||
        newProgram === "Upper Body B" ||
        newProgram === "Lower Body B"
      ) {
        details = "4 exercises planned";
      } else if (newProgram === "Lower Body A") {
        details = "5 exercises planned";
      } else if (newProgram === "Rest & Mobility" || newProgram === "Rest Day") {
        details = "Active recovery & stretching";
      } else if (newProgram === "Full Body Conditioning") {
        details = "6 exercises planned";
      } else if (newProgram) {
        details = "Program assigned";
      }

      return {
        ...item,
        program: newProgram,
        programId: programId || (newProgram ? item.programId : undefined),
        details,
      };
    });

    saveSchedule(updated);
  };

  const activeDaysCount = schedule.filter(
    (s) => s.program && s.program !== "Rest & Mobility" && s.program !== "Rest Day"
  ).length;

  return (
    <>
      <Header title="Schedule" />
      <main className="flex flex-col relative w-full pt-16 pb-24 bg-transparent min-h-screen text-[var(--custom-a30)]">
        <div className="flex flex-col w-full max-w-[840px] mx-auto px-4 py-4 gap-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold tracking-tight text-[var(--custom-a30)]">
                Weekly Schedule
              </h1>
              <p className="text-xs text-[var(--custom-a20)] mt-1">
                Tap any day to assign or switch your workout routine.
              </p>
            </div>

            {/* Active Frequency Pill */}
            <div className="hidden sm:flex flex-col items-end px-3 py-1.5 rounded-xl glass-panel">
              <span className="text-[10px] font-semibold uppercase text-[var(--custom-a20)]">
                Routine Frequency
              </span>
              <span className="text-xs font-bold text-[var(--custom-a40)] mt-0.5">
                {activeDaysCount} / 7 Days
              </span>
            </div>
          </div>

          {/* Loading state */}
          {(wsLoading || scheduleLoading) && (
            <div className="flex items-center justify-center gap-2 py-8 text-[var(--custom-a20)] text-xs">
              <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              <span>Loading schedule…</span>
            </div>
          )}

          {/* Weekly Schedule Rows */}
          {!wsLoading && !scheduleLoading && (
            <div className="flex flex-col gap-3" id="schedule-days-list">
              {schedule.map((dayItem) => {
                const hasProgram = Boolean(dayItem.program);
                const programUrl = dayItem.programId
                  ? `/programs/${dayItem.programId}`
                  : `/programs`;

                return (
                  <div
                    key={dayItem.day}
                    className={`w-full rounded-2xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      dayItem.isToday
                        ? "glass-panel border-l-4 border-l-[var(--custom-a40)] shadow-md"
                        : hasProgram
                        ? "glass-panel"
                        : "bg-[var(--custom-a10)]/40 border border-white/5 opacity-80"
                    }`}
                  >
                    <div
                      className="flex items-center gap-3.5 cursor-pointer select-none"
                      onClick={() => openPicker(dayItem.day, dayItem.program)}
                    >
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xs ${
                          dayItem.isToday
                            ? "bg-[var(--custom-a40)] text-[var(--custom-a0)] shadow-sm"
                            : hasProgram
                            ? "neu-outset text-[var(--custom-a30)]"
                            : "neu-inset text-[var(--custom-a20)]"
                        }`}
                      >
                        {dayItem.code}
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-[var(--custom-a30)]">
                            {dayItem.day}
                          </span>
                          {dayItem.isToday && (
                            <span className="px-2 py-0.5 rounded-full bg-[var(--custom-a40)]/20 text-[var(--custom-a40)] text-[10px] font-bold border border-[var(--custom-a40)]/40 animate-pulse">
                              Today
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-xs mt-0.5 ${
                            hasProgram
                              ? "text-[var(--custom-a20)]"
                              : "text-[var(--custom-a20)]/60 italic"
                          }`}
                        >
                          {dayItem.details}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
                      {hasProgram ? (
                        <>
                          <Link
                            href={programUrl}
                            className="h-10 px-3.5 rounded-xl neu-outset text-[var(--custom-a40)] font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer hover:bg-[var(--custom-a40)]/15"
                          >
                            <span>{dayItem.program}</span>
                            <span className="material-symbols-outlined text-[16px]">
                              arrow_forward
                            </span>
                          </Link>
                          <button
                            type="button"
                            aria-label={`Change ${dayItem.day} Program`}
                            className="w-10 h-10 rounded-xl neu-outset text-[var(--custom-a20)] hover:text-white transition-all flex items-center justify-center cursor-pointer"
                            onClick={() => openPicker(dayItem.day, dayItem.program)}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              swap_horiz
                            </span>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="h-10 w-full sm:w-auto px-4 rounded-xl neu-outset text-[var(--custom-a30)] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          onClick={() => openPicker(dayItem.day, dayItem.program)}
                        >
                          <span className="material-symbols-outlined text-[var(--custom-a40)] text-[16px]">
                            add_circle
                          </span>
                          <span>Assign Routine</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <BottomNav />

      <ProgramPickerModal
        isOpen={pickerState.isOpen}
        dayName={pickerState.dayName}
        currentProgram={pickerState.currentProgram}
        onClose={closePicker}
        onSelectProgram={handleSelectProgram}
        workspaceId={workspaceId}
      />
    </>
  );
}
