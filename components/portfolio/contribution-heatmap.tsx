import type { ContributionWeek } from "@/lib/github";

const LEVELS = ["#E7E1D4", "#D5DCC8", "#A6AD91", "#C78368", "#8F5A45"];

function level(count: number, max: number) {
  if (count <= 0 || max <= 0) return 0;
  const ratio = count / max;
  if (ratio < 0.25) return 1;
  if (ratio < 0.5) return 2;
  if (ratio < 0.75) return 3;
  return 4;
}

export function ContributionHeatmap({ weeks }: { weeks: ContributionWeek[] }) {
  const days = weeks.flat();
  const max = days.reduce((highest, day) => Math.max(highest, day.count), 0);
  const total = days.reduce((sum, day) => sum + day.count, 0);
  const start = days[0]?.date;
  const end = days.at(-1)?.date;

  if (!start || !end) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-4xl tracking-tight">Contributions</h2>
          <p className="mt-3 text-sm text-[#8A7B6E]">
            {total.toLocaleString()} contributions recorded by GitHub from {start}{" "}
            to {end}.
          </p>
        </div>
        <p className="text-xs uppercase tracking-[0.16em] text-[#A6AD91]">
          Less to more
        </p>
      </div>
      <div className="mt-8 overflow-x-auto">
        <div className="flex w-max gap-1">
          {weeks.map((week) => (
            <div key={week[0]?.date ?? week.length} className="grid gap-1">
              {week.map((day) => (
                <span
                  key={day.date}
                  title={`${day.date}: ${day.count} contributions`}
                  className="h-3 w-3 rounded-[3px]"
                  style={{ backgroundColor: LEVELS[level(day.count, max)] }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
