import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import PageTitle from "../components/PageTitle";
import EmptyRow from "../components/EmptyRow";
import RemarkTag from "../components/RemarkTag";
import { formatDate, isOverspeed } from "../utils/helpers";
import { subscribeToFirestoreDateLogs } from "../utils/firebase";

export default function GraphScreen({ selectedDate, threshold = 30 }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedDate) return;
    setLoading(true);

    const unsubscribe = subscribeToFirestoreDateLogs(selectedDate, (data) => {
      setEvents(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedDate]);

  const dayEvents = useMemo(
    () => events.filter((event) => event.event_date === selectedDate),
    [events, selectedDate]
  );

  const violations = useMemo(
    () => dayEvents.filter((event) => isOverspeed(event.speed, threshold)),
    [dayEvents, threshold]
  );

  const chartData = useMemo(() => {
    const buckets = {};

    violations.forEach((event) => {
      const time = event.event_time ? event.event_time.slice(0, 5) : "00:00";
      buckets[time] = (buckets[time] || 0) + 1;
    });

    return Object.keys(buckets)
      .sort()
      .map((time) => ({ time, events: buckets[time] }));
  }, [violations]);

  if (!selectedDate) {
    return (
      <div>
        <PageTitle title="Speed Monitoring Graph" />
        <div className="border border-gray-300 bg-white p-6 text-sm text-gray-600">
          Pick a date on the Speed Monitoring calendar to plot its results.
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title="Speed Monitoring Graph"
        subtitle={`Overspeeding frequency by timestamp for ${formatDate(selectedDate)}.`}
      />

      <div className="border border-gray-300 bg-white p-4 mb-6">
        <div className="h-72">
          {loading ? (
            <div className="h-full flex items-center justify-center text-sm text-gray-500">
              Loading graph data from Firestore...
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-gray-500">
              No overspeeding events recorded on this date.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="events" fill="#0284c7" name="Overspeeding events" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <p className="text-sm font-medium text-gray-800 mb-2">
        Filtered records, overspeeding only ({violations.length})
      </p>

      <div className="border border-gray-300 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              {["Date", "Time", "Speed (km/h)", "Remarks"].map((header) => (
                <th key={header} className="px-3 py-2 text-left font-medium text-gray-700">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <EmptyRow colSpan={4} message="Fetching records..." />
            ) : violations.length === 0 ? (
              <EmptyRow colSpan={4} message="No overspeeding events on this date." />
            ) : (
              violations.map((event, index) => (
                <tr key={event.event_id || index} className="border-b border-gray-200 last:border-b-0">
                  <td className="px-3 py-2">{formatDate(event.event_date)}</td>
                  <td className="px-3 py-2">{event.event_time}</td>
                  <td className="px-3 py-2 text-red-700 font-bold">{Number(event.speed).toFixed(2)}</td>
                  <td className="px-3 py-2">
                    <RemarkTag over />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}