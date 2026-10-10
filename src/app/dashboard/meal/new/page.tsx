import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MealForm } from "./meal-form";

export default function NewMealPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>New meal</CardTitle>
          <CardDescription>Log a meal for your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <MealForm />
        </CardContent>
      </Card>
    </main>
  );
}
