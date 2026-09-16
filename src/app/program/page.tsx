"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectToPrograms() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/programs");
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--custom-a0)] flex items-center justify-center text-[var(--custom-a20)] text-xs font-medium">
      Loading programs...
    </div>
  );
}
