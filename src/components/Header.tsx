"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useWorkspace } from "@/src/hooks/useWorkspace";

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title = "FitTrack" }) => {
  const { code, isLoading, switchWorkspace } = useWorkspace();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [inputCode, setInputCode] = useState<string>("");
  const [copyMsg, setCopyMsg] = useState<string>("");
  const [switchError, setSwitchError] = useState<string>("");
  const [switching, setSwitching] = useState<boolean>(false);

  function handleCopy() {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopyMsg("Copied!");
      setTimeout(() => setCopyMsg(""), 1800);
    });
  }

  async function handleSwitch() {
    if (!inputCode.trim()) return;
    setSwitching(true);
    setSwitchError("");
    const ok = await switchWorkspace(inputCode);
    setSwitching(false);
    if (ok) {
      setShowModal(false);
      setInputCode("");
      window.location.reload();
    } else {
      setSwitchError("Code not found. Check it and try again.");
    }
  }

  return (
    <>
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

          {/* Workspace code badge */}
          <button
            onClick={() => setShowModal(true)}
            title="Your workspace code — click to manage"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--custom-a10)]/40 border border-white/10 hover:bg-[var(--custom-a10)]/60 transition-colors"
          >
            <span className="material-symbols-outlined text-[14px] text-[var(--custom-a20)]">
              key
            </span>
            <span className="text-[10px] font-mono font-semibold text-[var(--custom-a30)] tracking-widest">
              {isLoading ? "···" : (code ?? "···")}
            </span>
          </button>
        </div>
      </header>

      {/* Workspace modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-[var(--custom-a0)] border border-white/10 rounded-2xl p-6 w-full max-w-xs shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-bold text-[var(--custom-a30)] mb-1">
              Your Workspace
            </h2>
            <p className="text-xs text-[var(--custom-a20)]/70 mb-4">
              Share this code with a friend so they can join your workspace, or
              enter their code to switch.
            </p>

            {/* Current code */}
            <div className="flex items-center gap-2 bg-[var(--custom-a10)]/40 rounded-xl px-3 py-2 mb-4">
              <span className="font-mono text-xl font-bold tracking-[0.2em] text-[var(--custom-a30)] flex-1">
                {code ?? "···"}
              </span>
              <button
                onClick={handleCopy}
                className="text-xs text-[var(--custom-a20)] hover:text-[var(--custom-a30)] transition-colors"
              >
                {copyMsg || "Copy"}
              </button>
            </div>

            {/* Switch workspace */}
            <p className="text-xs text-[var(--custom-a20)]/60 mb-2 font-medium">
              Enter a workspace code to switch:
            </p>
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="e.g. ABCD1234"
              maxLength={12}
              className="w-full bg-[var(--custom-a10)]/40 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono text-[var(--custom-a30)] placeholder:text-[var(--custom-a20)]/40 focus:outline-none focus:border-[var(--custom-a30)]/40 mb-2"
            />
            {switchError && (
              <p className="text-xs text-red-400 mb-2">{switchError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => { setShowModal(false); setSwitchError(""); setInputCode(""); }}
                className="flex-1 py-2 rounded-xl text-sm text-[var(--custom-a20)] bg-[var(--custom-a10)]/30 hover:bg-[var(--custom-a10)]/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSwitch}
                disabled={switching || !inputCode.trim()}
                className="flex-1 py-2 rounded-xl text-sm font-semibold text-[var(--custom-a0)] bg-[var(--custom-a40)] hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {switching ? "Switching…" : "Switch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
