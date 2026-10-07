"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

function localToday() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function DatePicker({ date }: { date: string | null }) {
  const router = useRouter();

  // No ?date= yet: default to the browser's current local date.
  useEffect(() => {
    if (!date) router.replace(`/dashboard?date=${localToday()}`);
  }, [date, router]);

  return (
    <input
      type="date"
      value={date ?? ""}
      onChange={(e) => e.target.value && router.push(`/dashboard?date=${e.target.value}`)}
      className="rounded-md border border-input bg-background px-3 py-2 text-sm"
      aria-label="Select date"
    />
  );
}
