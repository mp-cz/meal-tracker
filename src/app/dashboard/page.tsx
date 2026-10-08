"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Placeholder data for UI only; real data fetching comes later.
const meals = [
  { id: 1, name: "Oatmeal with berries", type: "Breakfast", calories: 350 },
  { id: 2, name: "Chicken salad", type: "Lunch", calories: 520 },
  { id: 3, name: "Greek yogurt", type: "Snack", calories: 150 },
  { id: 4, name: "Salmon with rice and vegetables", type: "Dinner", calories: 680 },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
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
                  setDate(d);
                  setOpen(false);
                }
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meals</CardTitle>
          <CardDescription>{format(date, "EEEE, MMMM d, yyyy")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {meals.map((meal) => (
            <Card key={meal.id} size="sm">
              <CardContent className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{meal.name}</span>
                  <Badge variant="secondary">{meal.type}</Badge>
                </div>
                <span className="text-sm text-muted-foreground">
                  {meal.calories} kcal
                </span>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
