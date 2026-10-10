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
        toast.success("Meal logged! Yum!");
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
