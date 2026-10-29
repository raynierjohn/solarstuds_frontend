import { useEffect, useMemo, useState } from "react";
import PageTitle from "../components/PageTitle";
import EmptyRow from "../components/EmptyRow";
import { MONTH_OPTIONS } from "../data/constants";
import { formatDate, getMonthKey, isOverspeed } from "../utils/helpers";
import { subscribeToLiveLogs } from "../utils/firebase";

export default function OverspeedingScreen({ threshold = 30 }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState("all");

  useEffect(() => {
    const unsubscribe = subscribeToLiveLogs((data) => {
      setEvents(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const rows = useMemo(() => {
    let list = events.filter((event) => isOverspeed(event.speed, threshold));

    if (month !== "all") {
      list = list.filter((event) => getMonthKey(event.event_date) === month);
    }

    return list.slice(0, 200);
  }, [events, threshold, month]);

  return (
    <div>
      <PageTitle
        title="Overspeeding Events"
        subtitle={`Vehicles recorded above the ${threshold} km/h limit.`}
      />

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-sm text-gray-600">Month:</span>

        <select
          value={month}
          onChange={(event) => setMonth(event.target.value)}
          className="border border-gray-300 px-2 py-1 text-sm bg-white"
        >
          <option value="all">All months</option>
          {MONTH_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <span className="text-sm text-gray-500 ml-auto">
          {loading ? "Connecting to Firebase..." : `Showing ${rows.length} violation records`}
        </span>
      </div>

      <div className="border border-gray-300 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              {["Event ID", "Date", "Time", "Speed (km/h)", "Over Limit By", "Stud ID"].map((header) => (
                <th key={header} className="px-3 py-2 text-left font-medium text-gray-700">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <EmptyRow colSpan={6} message="Loading live violations..." />
            ) : rows.length === 0 ? (
              <EmptyRow colSpan={6} message="No violations recorded for this period." />
            ) : (
              rows.map((event, index) => {
                const logNum = event.event_id ? event.event_id.replace(/\D/g, "") : index + 1;
                const displayId = `SpeedRecord_${logNum}`;

                return (
                  <tr key={event.event_id || index} className="border-b border-gray-200 last:border-b-0 bg-red-50">
                    <td className="px-3 py-2 text-gray-600 font-mono text-xs">{displayId}</td>
                    <td className="px-3 py-2">{formatDate(event.event_date)}</td>
                    <td className="px-3 py-2">{event.event_time}</td>
                    <td className="px-3 py-2 text-red-700 font-bold">
                      {Number(event.speed).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-red-600 font-medium">
                      +{(Number(event.speed) - threshold).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-gray-600">{event.stud_id || "STUD-02"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}