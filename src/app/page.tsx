import { SignUpButton } from "@clerk/nextjs";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Flame,
  Salad,
  Utensils,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: Utensils,
    title: "Log meals in seconds",
    description:
      "Capture breakfast, lunch, dinner and snacks with the foods you ate, no spreadsheets required.",
  },
  {
    icon: Flame,
    title: "Know your calories",
    description:
      "Every food item adds up automatically, so you always see what each meal and each day really costs.",
  },
  {
    icon: CalendarDays,
    title: "Pick any day",
    description:
      "Jump to any date on your dashboard to review, fix or fill in what you ate.",
  },
  {
    icon: BarChart3,
    title: "Spot the trends",
    description:
      "See how your week is shaping up and keep your eating habits on track.",
  },
];

const steps = [
  { title: "Create a free account", description: "Sign up in a few clicks." },
  { title: "Log what you eat", description: "Add meals and food items." },
  { title: "Review your day", description: "Watch the calories add up." },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-6 py-20 text-center sm:py-28">
        <Badge variant="secondary" className="gap-1.5">
          <Salad className="size-3.5" />
          Simple calorie tracking
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Eat with intention.
          <br />
          <span className="text-muted-foreground">Track without the fuss.</span>
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Meal Tracker is a clean, fast way to log what you eat and see exactly
          how many calories go into every meal and every day.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <SignUpButton mode="modal">
            <Button size="lg">
              Get started free
              <ArrowRight />
            </Button>
          </SignUpButton>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-20">
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <CardHeader>
                <Icon className="mb-2 size-6" />
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-24">
        <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight">
          How it works
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map(({ title, description }, index) => (
            <Card key={title}>
              <CardHeader>
                <Badge variant="outline" className="mb-2 w-fit">
                  Step {index + 1}
                </Badge>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
