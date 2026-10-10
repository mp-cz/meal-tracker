#!/usr/bin/env python3
"""Bar chart of calories per meal for the past 7 days, exported as an image."""
import os
import sys
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import psycopg

QUERY = """
SELECT m.eaten_at, m.meal_type::text, COALESCE(SUM(mi.calories), 0)::float AS calories
FROM meals m
LEFT JOIN meal_items mi ON mi.meal_id = m.id
WHERE m.eaten_at >= now() - interval '7 days'
GROUP BY m.id, m.eaten_at, m.meal_type
ORDER BY m.eaten_at
"""

COLORS = {
    "breakfast": "#f59e0b",
    "lunch": "#84cc16",
    "dinner": "#3b82f6",
    "snack": "#ec4899",
}


def load_database_url() -> str:
    for directory in (Path.cwd(), *Path.cwd().parents):
        for name in (".env.local", ".env"):
            path = directory / name
            if not path.is_file():
                continue
            for line in path.read_text().splitlines():
                key, sep, value = line.partition("=")
                if sep and key.strip() == "DATABASE_URL":
                    return value.strip().strip("'\"")
    url = os.environ.get("DATABASE_URL")
    if not url:
        sys.exit("DATABASE_URL not found in .env.local, .env, or the environment.")
    return url


def main() -> None:
    output = sys.argv[1] if len(sys.argv) > 1 else "weekly-calories.png"

    with psycopg.connect(load_database_url()) as conn:
        conn.read_only = True  # Postgres rejects any write in this session
        rows = conn.execute(QUERY).fetchall()

    if not rows:
        print("No meals logged in the past 7 days; no chart written.")
        return

    labels = [f"{eaten:%a %d %b}\n{kind}" for eaten, kind, _ in rows]
    calories = [c for _, _, c in rows]
    colors = [COLORS.get(kind, "#6b7280") for _, kind, _ in rows]

    fig, ax = plt.subplots(figsize=(max(8, len(rows) * 0.8), 5))
    ax.bar(range(len(rows)), calories, color=colors)
    ax.set_xticks(range(len(rows)), labels, fontsize=8)
    ax.set_xlabel("Past week")
    ax.set_ylabel("Calories per meal (kcal)")
    ax.set_title("Calories per meal, past 7 days")
    ax.legend(
        handles=[plt.Rectangle((0, 0), 1, 1, color=c) for c in COLORS.values()],
        labels=list(COLORS),
        title="Meal type",
    )
    fig.tight_layout()
    fig.savefig(output, dpi=150)
    print(f"Saved {output}: {len(rows)} meals, {sum(calories):.0f} kcal total.")


if __name__ == "__main__":
    main()
