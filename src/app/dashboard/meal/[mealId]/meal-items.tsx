"use client";

import { useState, useTransition } from "react";
import { ChevronsUpDown, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  addMealItemAction,
  createFoodItemAction,
  removeMealItemAction,
  updateMealItemAction,
} from "./actions";

type Food = {
  id: string;
  name: string;
  servingSize: string;
  servingUnit: string;
  calories: string;
};

type Item = {
  id: string;
  servings: string;
  calories: string;
  proteinG: string;
  carbsG: string;
  fatG: string;
  foodItem: { name: string; servingSize: string; servingUnit: string };
};

const emptyFood = {
  name: "",
  servingSize: "1",
  servingUnit: "serving",
  calories: "0",
  proteinG: "0",
  carbsG: "0",
  fatG: "0",
};

const fmt = (n: number) => String(Math.round(n * 10) / 10);

// Client-only: collects input and calls Server Actions with typed params.
export function MealItems({
  mealId,
  items,
  foods,
}: {
  mealId: string;
  items: Item[];
  foods: Food[];
}) {
  const [isPending, startTransition] = useTransition();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [servings, setServings] = useState("1");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [newFood, setNewFood] = useState(emptyFood);

  const selectedFood = foods.find((f) => f.id === selectedFoodId);
  const total = (key: "calories" | "proteinG" | "carbsG" | "fatG") =>
    items.reduce((sum, i) => sum + Number(i[key]), 0);

  function run(action: () => Promise<unknown>, success: string, onDone?: () => void) {
    startTransition(async () => {
      try {
        await action();
        toast.success(success);
        onDone?.();
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  function onAdd() {
    const n = Number(servings);
    if (!selectedFoodId || !(n > 0)) return;
    run(
      () => addMealItemAction({ mealId, foodItemId: selectedFoodId, servings: n }),
      "Food added",
      () => {
        setSelectedFoodId(null);
        setServings("1");
      },
    );
  }

  function onSaveServings(item: Item) {
    const draft = drafts[item.id];
    if (draft === undefined) return;
    const n = Number(draft);
    setDrafts((d) => Object.fromEntries(Object.entries(d).filter(([k]) => k !== item.id)));
    if (!(n > 0) || n === Number(item.servings)) return;
    run(() => updateMealItemAction({ id: item.id, servings: n }), "Servings updated");
  }

  function onCreateFood(e: React.FormEvent) {
    e.preventDefault();
    run(
      async () => {
        const { id } = await createFoodItemAction({
          mealId,
          name: newFood.name,
          servingSize: Number(newFood.servingSize),
          servingUnit: newFood.servingUnit,
          calories: Number(newFood.calories),
          proteinG: Number(newFood.proteinG),
          carbsG: Number(newFood.carbsG),
          fatG: Number(newFood.fatG),
        });
        setSelectedFoodId(id);
      },
      "Food created",
      () => {
        setCreateOpen(false);
        setNewFood(emptyFood);
      },
    );
  }

  const numberFields = [
    { key: "calories", label: "Calories (kcal)" },
    { key: "proteinG", label: "Protein (g)" },
    { key: "carbsG", label: "Carbs (g)" },
    { key: "fatG", label: "Fat (g)" },
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex min-w-48 flex-1 flex-col gap-2">
          <Label>Food</Label>
          <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger
              render={<Button variant="outline" className="justify-between" />}
            >
              {selectedFood ? selectedFood.name : "Select a food..."}
              <ChevronsUpDown className="opacity-50" />
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="start">
              <Command>
                <CommandInput placeholder="Search foods..." />
                <CommandList>
                  <CommandEmpty>No food found.</CommandEmpty>
                  <CommandGroup>
                    {foods.map((food) => (
                      <CommandItem
                        key={food.id}
                        value={food.name}
                        onSelect={() => {
                          setSelectedFoodId(food.id);
                          setPickerOpen(false);
                        }}
                      >
                        {food.name}
                        <span className="ml-auto text-xs text-muted-foreground">
                          {food.servingSize} {food.servingUnit} ·{" "}
                          {fmt(Number(food.calories))} kcal
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
              <div className="border-t p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    setPickerOpen(false);
                    setCreateOpen(true);
                  }}
                >
                  <Plus /> Create custom food
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex w-28 flex-col gap-2">
          <Label htmlFor="servings">
            Servings{selectedFood ? ` (${selectedFood.servingUnit})` : ""}
          </Label>
          <Input
            id="servings"
            type="number"
            min="0"
            step="any"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
          />
        </div>
        <Button
          onClick={onAdd}
          disabled={isPending || !selectedFoodId || !(Number(servings) > 0)}
        >
          <Plus /> Add
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Food</TableHead>
            <TableHead className="w-24">Servings</TableHead>
            <TableHead className="text-right">kcal</TableHead>
            <TableHead className="text-right">P</TableHead>
            <TableHead className="text-right">C</TableHead>
            <TableHead className="text-right">F</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No food logged yet.
              </TableCell>
            </TableRow>
          )}
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.foodItem.name}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  aria-label={`Servings of ${item.foodItem.name}`}
                  value={drafts[item.id] ?? item.servings}
                  onChange={(e) =>
                    setDrafts((d) => ({ ...d, [item.id]: e.target.value }))
                  }
                  onBlur={() => onSaveServings(item)}
                  onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                  disabled={isPending}
                />
              </TableCell>
              <TableCell className="text-right">{fmt(Number(item.calories))}</TableCell>
              <TableCell className="text-right">{fmt(Number(item.proteinG))}</TableCell>
              <TableCell className="text-right">{fmt(Number(item.carbsG))}</TableCell>
              <TableCell className="text-right">{fmt(Number(item.fatG))}</TableCell>
              <TableCell>
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove ${item.foodItem.name}`}
                      />
                    }
                  >
                    <Trash2 />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove {item.foodItem.name}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This removes the item from this meal.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          run(
                            () => removeMealItemAction({ id: item.id }),
                            "Food removed",
                          )
                        }
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        {items.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell className="text-right">{fmt(total("calories"))}</TableCell>
              <TableCell className="text-right">{fmt(total("proteinG"))}</TableCell>
              <TableCell className="text-right">{fmt(total("carbsG"))}</TableCell>
              <TableCell className="text-right">{fmt(total("fatG"))}</TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        )}
      </Table>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create custom food</DialogTitle>
            <DialogDescription>
              Nutrition values are per serving.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onCreateFood} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="foodName">Name</Label>
              <Input
                id="foodName"
                required
                maxLength={100}
                value={newFood.name}
                onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="servingSize">Serving size</Label>
                <Input
                  id="servingSize"
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={newFood.servingSize}
                  onChange={(e) =>
                    setNewFood({ ...newFood, servingSize: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="servingUnit">Unit</Label>
                <Input
                  id="servingUnit"
                  required
                  maxLength={20}
                  value={newFood.servingUnit}
                  onChange={(e) =>
                    setNewFood({ ...newFood, servingUnit: e.target.value })
                  }
                />
              </div>
              {numberFields.map(({ key, label }) => (
                <div key={key} className="flex flex-col gap-2">
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={newFood[key]}
                    onChange={(e) =>
                      setNewFood({ ...newFood, [key]: e.target.value })
                    }
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Create food"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
