import { useEffect, useMemo, useState } from "react";
import PageTitle from "../components/PageTitle";
import { CALENDAR_YEAR, MONTHS, WEEKDAYS } from "../data/constants";
import { formatDate, pad } from "../utils/helpers";
import { fetchMonthCounts } from "../utils/firebase"; 

export default function SpeedMonitoringScreen({ events = [], selectedDate, onSelectDate }) {
  const [month, setMonth] = useState(() => {
    if (selectedDate) return Number(selectedDate.split("-")[1]) - 1;
    const now = new Date();
    return now.getFullYear() === CALENDAR_YEAR ? now.getMonth() : 0;
  });

  const [firestoreCounts, setFirestoreCounts] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingCounts(true);

    fetchMonthCounts(CALENDAR_YEAR, month)
      .then((counts) => {
        if (!cancelled) setFirestoreCounts((prev) => ({ ...prev, ...counts }));
      })
      .catch((err) => console.error("Failed to load month counts:", err))
      .finally(() => {
        if (!cancelled) setLoadingCounts(false);
      });

    return () => {
      cancelled = true;
    };
  }, [month]);

  // Fallback counts from the live RTDB events passed in as a prop
  const countsByDate = useMemo(() => {
    const map = {};
    events.forEach((event) => {
      const key = typeof event.event_date === "string" ? event.event_date.trim() : null;
      if (key) {
        map[key] = (map[key] || 0) + 1;
      }
    });
    return map;
  }, [events]);

  const cells = useMemo(() => {
    const firstDay = new Date(CALENDAR_YEAR, month, 1).getDay();
    const daysInMonth = new Date(CALENDAR_YEAR, month + 1, 0).getDate();
    const result = Array(firstDay).fill(null);

    for (let day = 1; day <= daysInMonth; day++) result.push(day);
    return result;
  }, [month]);

  return (
    <div>
      <PageTitle
        title="Speed Monitoring"
        subtitle={`Select a date to review its recorded traffic logs. Calendar year ${CALENDAR_YEAR}.`}
      />

      <div className="border border-gray-300 bg-white">
        <div className="flex items-center justify-between border-b border-gray-300 px-4 py-3">
          <button
            onClick={() => setMonth((m) => Math.max(0, m - 1))}
            disabled={month === 0}
            className="text-sm px-3 py-1 border border-gray-300 disabled:opacity-40 hover:bg-gray-100"
          >
            Previous
          </button>

          <p className="text-sm font-medium text-gray-900">
            {MONTHS[month]} {CALENDAR_YEAR}
            {loadingCounts && (
              <span className="ml-2 text-xs font-normal text-gray-400">Loading…</span>
            )}
          </p>

          <button
            onClick={() => setMonth((m) => Math.min(11, m + 1))}
            disabled={month === 11}
            className="text-sm px-3 py-1 border border-gray-300 disabled:opacity-40 hover:bg-gray-100"
          >
            Next
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-gray-300">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="text-xs text-gray-500 text-center py-2 border-r border-gray-200 last:border-r-0 font-medium"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((day, index) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${index}`}
                  className="h-20 border-r border-b border-gray-200 bg-gray-50"
                />
              );
            }

            const iso = `${CALENDAR_YEAR}-${pad(month + 1)}-${pad(day)}`;
            const count = firestoreCounts[iso] || countsByDate[iso] || 0;
            const isSelected = selectedDate === iso;

            return (
              <button
                key={iso}
                onClick={() => onSelectDate(iso)}
                className={`h-20 border-r border-b border-gray-200 p-2 text-left align-top transition-colors ${
                  isSelected
                    ? "bg-gray-900 text-white"
                    : count > 0
                    ? "bg-white hover:bg-blue-50"
                    : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                }`}
              >
                <span className="text-sm font-medium">{day}</span>
                {count > 0 && (
                  <span
                    className={`block text-xs mt-1 font-semibold ${
                      isSelected ? "text-blue-200" : "text-blue-600"
                    }`}
                  >
                    {count} record{count === 1 ? "" : "s"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-gray-600 mt-4">
        {selectedDate
          ? `Selected date: ${formatDate(selectedDate)}. Open Speed Records or Speed Graph to view detailed logs.`
          : "No date selected yet."}
      </p>
    </div>
  );
}