import { useMemo, useState } from "react";
import PageTitle from "../components/PageTitle";
import EmptyRow from "../components/EmptyRow";
import RemarkTag from "../components/RemarkTag";
import { formatDate, isOverspeed } from "../utils/helpers";

export default function SpeedRecordsScreen({ events, selectedDate, threshold }) {
  const [sortKey, setSortKey] = useState("event_time");
  const [sortAsc, setSortAsc] = useState(true);
  const [filter, setFilter] = useState("all");

  const rows = useMemo(() => {
    let list = events.filter((event) => event.event_date === selectedDate);

    if (filter === "over") {
      list = list.filter((event) => isOverspeed(event.speed, threshold));
    } else if (filter === "normal") {
      list = list.filter((event) => !isOverspeed(event.speed, threshold));
    }

    return [...list].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp =
        typeof av === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));

      return sortAsc ? cmp : -cmp;
    });
  }, [events, selectedDate, filter, sortKey, sortAsc, threshold]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortAsc((value) => !value);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const arrow = (key) =>
    sortKey === key ? (sortAsc ? " ▲" : " ▼") : "";

  if (!selectedDate) {
    return (
      <div>
        <PageTitle title="Speed Records" />
        <div className="border border-gray-300 bg-white p-6 text-sm text-gray-600">
          Pick a date on the Speed Monitoring calendar to load its records.
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title="Speed Records"
        subtitle={`Vehicle detections logged on ${formatDate(selectedDate)}.`}
      />

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-sm text-gray-600">Filter:</span>

        {[
          ["all", "All records"],
          ["over", "Overspeeding only"],
          ["normal", "Within limit"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`text-sm px-3 py-1 border ${
              filter === key
                ? "bg-gray-900 text-white border-gray-900"
                : "border-gray-300 hover:bg-gray-100"
            }`}
          >
            {label}
          </button>
        ))}

        <span className="text-sm text-gray-500 ml-auto">
          {rows.length} record{rows.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="border border-gray-300 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              {[
                ["event_date", "Date"],
                ["event_time", "Time"],
                ["speed", "Speed (km/h)"],
                ["overspeed_flag", "Remarks"],
              ].map(([key, label]) => (
                <th
                  key={key}
                  onClick={() => toggleSort(key)}
                  className="px-3 py-2 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-200 select-none"
                >
                  {label}{arrow(key)}
                </th>
              ))}
              <th className="px-3 py-2 text-left font-medium text-gray-700">
                Stud ID
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <EmptyRow colSpan={5} message="No records match this filter." />
            ) : (
              rows.map((event) => (
                <tr key={event.event_id} className="border-b border-gray-200 last:border-b-0">
                  <td className="px-3 py-2">{formatDate(event.event_date)}</td>
                  <td className="px-3 py-2">{event.event_time}</td>
                  <td className="px-3 py-2">{event.speed.toFixed(2)}</td>
                  <td className="px-3 py-2">
                    <RemarkTag over={isOverspeed(event.speed, threshold)} />
                  </td>
                  <td className="px-3 py-2 text-gray-600">{event.stud_id}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
