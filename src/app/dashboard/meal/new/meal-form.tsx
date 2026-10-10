"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createMealAction } from "./actions";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

const mealTypes: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
];

// Client-only: collects input and calls the Server Action with typed params.
export function MealForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [eatenAt, setEatenAt] = useState(() =>
    format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  );
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await createMealAction({ mealType, eatenAt: new Date(eatenAt) });
        toast.custom(
          () => (
            <div className="flex w-56 flex-col items-center gap-1 rounded-t-[3rem] rounded-b-2xl border-2 border-amber-600/60 bg-amber-200 px-6 pt-6 pb-4 text-amber-950 shadow-lg">
              <div className="flex items-center gap-5">
                <span className="size-2.5 rounded-full bg-amber-950" />
                <span className="size-2.5 rounded-full bg-amber-950" />
              </div>
              <div className="flex w-full items-center justify-between">
                <span className="size-3 rounded-full bg-pink-400/70" />
                <span className="h-3 w-5 rounded-b-full border-b-2 border-amber-950" />
                <span className="size-3 rounded-full bg-pink-400/70" />
              </div>
              <p className="mt-1 text-center text-sm font-semibold">
                Meal logged! Yum!
              </p>
            </div>
          ),
          { duration: 4000 },
        );
        router.push(`/dashboard?date=${eatenAt.slice(0, 10)}`);
      } catch {
        setError("Could not save the meal. Please try again.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="mealType">Meal type</Label>
        <Select
          value={mealType}
          onValueChange={(v) => setMealType(v as MealType)}
          items={mealTypes}
        >
          <SelectTrigger id="mealType" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {mealTypes.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="eatenAt">Date and time</Label>
        <Input
          id="eatenAt"
          type="datetime-local"
          required
          value={eatenAt}
          onChange={(e) => setEatenAt(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending || !eatenAt}>
          {isPending ? "Saving..." : "Create meal"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
