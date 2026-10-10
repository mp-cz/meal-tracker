"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Client-only: picking a date navigates to ?date=yyyy-MM-dd; data is fetched in the page.
// Also records the browser timezone in a cookie so the server can compute day ranges.
export function DatePicker({ dateKey }: { dateKey: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const date = parse(dateKey, "yyyy-MM-dd", new Date());

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!document.cookie.split("; ").includes(`tz=${encodeURIComponent(tz)}`)) {
      document.cookie = `tz=${encodeURIComponent(tz)}; path=/; max-age=31536000; samesite=lax`;
      router.refresh();
    }
  }, [router]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={<Button variant="outline" className="w-60 justify-start" />}
      >
        <CalendarIcon />
        {format(date, "PPP")}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          onSelect={(d) => {
            if (d) {
              setOpen(false);
              router.push(`/dashboard?date=${format(d, "yyyy-MM-dd")}`);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
