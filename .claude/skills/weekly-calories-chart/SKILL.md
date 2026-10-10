---
name: weekly-calories-chart
description: Query the database for all meals logged in the past 7 days and export a bar chart (calories per meal) as a PNG. Use when asked to chart, plot, or visualize recent meal calories.
---

# Weekly calories chart

Plots every meal from the past 7 days as a bar chart and saves it as an image.

- x-axis: the past week (one bar per meal, in chronological order, labelled with day and meal type)
- y-axis: calories per meal (sum of the meal's `meal_items.calories`)

## Steps

1. Make sure the Python dependencies are installed (once):
   `python3 -m pip install "psycopg[binary]" matplotlib`
2. Run the script from the project root:
   `python3 .claude/skills/weekly-calories-chart/scripts/weekly_calories_chart.py [output.png]`
   - The connection string is read from `DATABASE_URL` in `.env.local` (falls back to `.env`, then the process environment). Never print or echo it.
   - Output defaults to `weekly-calories.png` in the current directory.
3. Tell the user where the image was saved and summarize it (number of meals, total calories). If there are no meals in the past week, the script says so and writes no image.

## Notes

- The query is read-only (`SELECT`) and covers all users in the database, since the script talks to the database directly rather than through the app.
- Meals with no food items count as 0 calories.
