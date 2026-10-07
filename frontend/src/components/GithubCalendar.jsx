import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const getAPIUrl = () => {
  // Same logic used elsewhere for API URL resolution
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.MODE === 'development') return 'http://localhost:5000/api';
  return '/api';
};

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

  if (loading) {
    return (
      <div className="mt-24 lg:mt-32 w-full h-40 flex items-center justify-center border border-zinc-800 rounded-lg bg-[#0e0e10]">
        <span className="text-xs font-mono text-zinc-500 animate-pulse">Loading contributions...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mt-24 lg:mt-32 w-full p-4 border border-zinc-800 rounded-lg bg-[#0e0e10] text-center">
        <span className="text-xs font-mono text-zinc-500">Failed to load contributions.</span>
      </div>
    );
  }

  const { totalContributions, weeks } = data;

  // Flatten days to easily map colors and counts
  const allDays = weeks.flatMap(week => week.contributionDays);

  // Group days by weekday (0 = Sunday, 1 = Monday, ...)
  // GitHub returns weeks starting on Sunday.
  const rows = [[], [], [], [], [], [], []];
  weeks.forEach(week => {
    // Fill in days based on weekday
    week.contributionDays.forEach(day => {
      const dateObj = new Date(day.date);
      const dayOfWeek = dateObj.getUTCDay(); // 0-6
      rows[dayOfWeek].push(day);
    });
  });

  // Calculate month labels position
  // Find the first day of each month
  const monthLabels = [];
  let currentMonth = -1;
  weeks.forEach((week, index) => {
    const firstDayOfWeek = week.contributionDays[0];
    if (firstDayOfWeek) {
      const month = new Date(firstDayOfWeek.date).getUTCMonth();
      if (month !== currentMonth) {
        monthLabels.push({ index, label: new Date(firstDayOfWeek.date).toLocaleString('default', { month: 'short' }) });
        currentMonth = month;
      }
    }
  });

  // Render contribution level styles based on count
  // GitHub colors from GraphQL are provided, but we want to fit the editorial style (restrained green/amber or monochrome).
  // The user requested "restrained green/amber-compatible accent". We'll use a muted green palette.
  const getLevelClass = (count) => {
    if (count === 0) return 'bg-[#161b22] border-[#1b1f27]';
    if (count <= 2) return 'bg-[#0e4429] border-[#0e4429]';
    if (count <= 5) return 'bg-[#006d32] border-[#006d32]';
    if (count <= 10) return 'bg-[#26a641] border-[#26a641]';
    return 'bg-[#39d353] border-[#39d353]';
  };

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6 }}
      className="mt-24 lg:mt-32"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4">
        <div>
          <a
            href="https://github.com/Maur1k"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
              {totalContributions} contributions in the last year
            </h3>
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-zinc-500 group-hover:fill-zinc-300 transition-colors" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.59 2 12.25c0 4.53 2.87 8.37 6.84 9.72.5.09.68-.22.68-.49v-1.7C6.73 20.36 6.14 18.37 6.14 18.37c-.46-1.19-1.12-1.5-1.12-1.5-.91-.64.07-.62.07-.62 1.01.07 1.54 1.06 1.54 1.06.9 1.57 2.36 1.12 2.93.85.09-.66.35-1.12.64-1.37-2.24-.26-4.59-1.15-4.59-5.1 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05a9.4 9.4 0 012.5-.34c.85 0 1.7.11 2.5.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.64 1.03 2.76 0 3.96-2.35 4.84-4.59 5.1.36.32.68.94.68 1.9v2.82c0 .27.18.59.69.49C19.13 20.62 22 16.78 22 12.25 22 6.59 17.52 2 12 2z"/>
            </svg>
          </a>
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
        <div className="inline-block min-w-max p-5 border border-zinc-200 dark:border-zinc-800/80 rounded-lg bg-slate-50 dark:bg-[#0c0d10]">
          
          {/* Months Header */}
          <div className="flex mb-2">
            <div className="w-8 shrink-0"></div> {/* Spacer for weekday labels */}
            <div className="flex-1 relative h-4">
              {monthLabels.map(({ index, label }, i) => (
                <span
                  key={i}
                  className="absolute text-[10px] text-zinc-500 dark:text-zinc-500 font-mono"
                  style={{ left: `${(index / weeks.length) * 100}%` }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="flex gap-[3px]">
            {/* Weekday Labels (Mon, Wed, Fri) */}
            <div className="flex flex-col gap-[3px] w-8 shrink-0 justify-between text-[9px] font-mono text-zinc-500 dark:text-zinc-500 text-right pr-2">
              <span className="mt-[13px]">Mon</span>
              <span className="mt-[13px]">Wed</span>
              <span className="mt-[13px]">Fri</span>
            </div>

            {/* Weeks */}
            {weeks.map((week, wIndex) => (
              <div key={wIndex} className="flex flex-col gap-[3px]">
                {/* Ensure each week has 7 slots, GitHub might return partial weeks at start/end */}
                {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
                  const day = week.contributionDays.find(d => new Date(d.date).getUTCDay() === dayOfWeek);
                  if (!day) return <div key={dayOfWeek} className="w-[11px] h-[11px] rounded-sm bg-transparent" />;
                  
                  return (
                    <div
                      key={day.date}
                      title={`${day.contributionCount} contributions on ${day.date}`}
                      className={`w-[11px] h-[11px] rounded-sm border ${getLevelClass(day.contributionCount)} transition-colors hover:border-zinc-400 dark:hover:border-zinc-500 cursor-default`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <a href="https://github.com/Maur1k" target="_blank" rel="noreferrer" className="hover:text-zinc-300 transition-colors">
              Learn how we count contributions
            </a>
            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <div className="flex gap-[3px]">
                <div className="w-[11px] h-[11px] rounded-sm border bg-[#161b22] border-[#1b1f27]" />
                <div className="w-[11px] h-[11px] rounded-sm border bg-[#0e4429] border-[#0e4429]" />
                <div className="w-[11px] h-[11px] rounded-sm border bg-[#006d32] border-[#006d32]" />
                <div className="w-[11px] h-[11px] rounded-sm border bg-[#26a641] border-[#26a641]" />
                <div className="w-[11px] h-[11px] rounded-sm border bg-[#39d353] border-[#39d353]" />
              </div>
              <span>More</span>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
