import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const getAPIUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.MODE === 'development') return 'http://localhost:5000/api';
  return '/api';
};

// Intensity levels — muted greens matching the dark editorial palette / amber accent
const getLevelStyle = (count) => {
  if (count === 0) return { backgroundColor: 'transparent', border: '1px solid #27272A' };
  if (count <= 2)  return { backgroundColor: '#14532d', border: '1px solid #14532d' };
  if (count <= 5)  return { backgroundColor: '#15803d', border: '1px solid #15803d' };
  if (count <= 10) return { backgroundColor: '#22c55e', border: '1px solid #22c55e' };
  return            { backgroundColor: '#4ade80', border: '1px solid #4ade80' };
};

const DAYS = [0, 1, 2, 3, 4, 5, 6]; // Sun–Sat

export default function GithubCalendar() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const response = await fetch(`${getAPIUrl()}/github/calendar`);
        if (!response.ok) throw new Error('Failed to fetch calendar');
        const json = await response.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendar();
  }, []);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="mt-20 lg:mt-28 border-t border-slate-200 dark:border-zinc-900 pt-8">
        <p className="font-mono text-xs uppercase tracking-widest text-slate-400 dark:text-zinc-600">Activity</p>
        <div className="mt-6 h-28 flex items-center">
          <span className="font-mono text-xs text-zinc-600 animate-pulse">Loading contributions...</span>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="mt-20 lg:mt-28 border-t border-slate-200 dark:border-zinc-900 pt-8">
        <p className="font-mono text-xs uppercase tracking-widest text-slate-400 dark:text-zinc-600">Activity</p>
        <p className="mt-6 font-mono text-xs text-zinc-600">Failed to load contribution data.</p>
      </div>
    );
  }

  const { totalContributions, weeks } = data;

  // Slice to start from June (month 5)
  const juneIdx = weeks.findIndex(w => {
    const d = w.contributionDays[0];
    return d && new Date(d.date).getUTCMonth() === 5;
  });
  const visibleWeeks = juneIdx !== -1 ? weeks.slice(juneIdx) : weeks;

  // Month label positions
  const monthLabels = [];
  let curMonth = -1;
  visibleWeeks.forEach((week, i) => {
    const first = week.contributionDays[0];
    if (!first) return;
    const m = new Date(first.date).getUTCMonth();
    if (m !== curMonth) {
      monthLabels.push({ index: i, label: new Date(first.date).toLocaleString('default', { month: 'short' }) });
      curMonth = m;
    }
  });

  const nWeeks = visibleWeeks.length;

  // ── Legend cells (reusable) ──────────────────────────────────────────────
  const legendCounts = [0, 1, 3, 6, 12];

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6 }}
      className="mt-20 lg:mt-28"
    >
      {/* Section header */}
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-slate-400 dark:text-zinc-600">
          Activity
        </p>
        <div className="mt-2">
          <a
            href="https://github.com/Maur1k"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
              {totalContributions.toLocaleString()} contributions in the last year
            </h3>
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-zinc-600 group-hover:fill-zinc-400 transition-colors shrink-0" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.59 2 12.25c0 4.53 2.87 8.37 6.84 9.72.5.09.68-.22.68-.49v-1.7C6.73 20.36 6.14 18.37 6.14 18.37c-.46-1.19-1.12-1.5-1.12-1.5-.91-.64.07-.62.07-.62 1.01.07 1.54 1.06 1.54 1.06.9 1.57 2.36 1.12 2.93.85.09-.66.35-1.12.64-1.37-2.24-.26-4.59-1.15-4.59-5.1 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05a9.4 9.4 0 012.5-.34c.85 0 1.7.11 2.5.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.64 1.03 2.76 0 3.96-2.35 4.84-4.59 5.1.36.32.68.94.68 1.9v2.82c0 .27.18.59.69.49C19.13 20.62 22 16.78 22 12.25 22 6.59 17.52 2 12 2z"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Calendar */}
      <div className="border-t border-slate-200 dark:border-zinc-900 pt-6">

        {/*
          Responsive layout strategy:
          - The entire grid uses w-full so it fills the parent container.
          - Each week column uses flex:1 to split available width equally.
          - The row of 7 cells uses flex:1 vertically within a fixed-height column.
          - On mobile we set a shorter height; on desktop a taller one.
          - Cells auto-size: width = (container - day-label-col) / nWeeks, height = gridHeight / 7.
        */}

        {/* Month header */}
        <div
          className="flex mb-2"
          style={{ paddingLeft: 32 /* matches day-label width */ }}
        >
          {visibleWeeks.map((_, wIndex) => {
            const match = monthLabels.find(m => m.index === wIndex);
            return (
              <div key={wIndex} style={{ flex: 1, minWidth: 0 }}>
                {match && (
                  <span className="text-[10px] font-mono text-zinc-500 whitespace-nowrap select-none">
                    {match.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Grid rows */}
        {/* h-[88px] mobile → sm:h-[110px] desktop — gives ~12.5 / ~15.7px per cell */}
        <div className="flex h-[88px] sm:h-[110px] lg:h-[126px]">

          {/* Day-of-week labels — fixed width column */}
          <div className="flex flex-col justify-between shrink-0 text-right pr-2" style={{ width: 32 }}>
            <span className="text-[9px] font-mono text-zinc-600 leading-none select-none">Mon</span>
            <span className="text-[9px] font-mono text-zinc-600 leading-none select-none">Wed</span>
            <span className="text-[9px] font-mono text-zinc-600 leading-none select-none">Fri</span>
          </div>

          {/* Week columns — each takes flex:1 of remaining width */}
          <div className="flex flex-1 gap-[2px] sm:gap-[3px]">
            {visibleWeeks.map((week, wIndex) => (
              <div
                key={wIndex}
                className="flex flex-col flex-1 gap-[2px] sm:gap-[3px]"
                style={{ minWidth: 0 }}
              >
                {DAYS.map((dayOfWeek) => {
                  const day = week.contributionDays.find(
                    d => new Date(d.date).getUTCDay() === dayOfWeek
                  );

                  if (!day) {
                    // Placeholder for partial weeks (start/end of data)
                    return <div key={dayOfWeek} className="flex-1" style={{ minHeight: 0 }} />;
                  }

                  const levelStyle = getLevelStyle(day.contributionCount);
                  const label = `${day.contributionCount} contribution${day.contributionCount !== 1 ? 's' : ''} on ${
                    new Date(day.date).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
                    })
                  }`;

                  return (
                    <div
                      key={day.date}
                      title={label}
                      className="flex-1 hover:opacity-60 transition-opacity cursor-default"
                      style={{
                        minHeight: 0,
                        borderRadius: 2,
                        ...levelStyle,
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-end gap-2 text-[10px] font-mono text-zinc-600 select-none">
          <span>Less</span>
          <div className="flex gap-[3px]">
            {legendCounts.map(count => (
              <div
                key={count}
                style={{ width: 10, height: 10, borderRadius: 2, ...getLevelStyle(count) }}
              />
            ))}
          </div>
          <span>More</span>
        </div>

      </div>
    </motion.div>
  );
}
