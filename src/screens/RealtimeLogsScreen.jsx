import { useEffect, useMemo, useState } from "react";
import PageTitle from "../components/PageTitle";
import EmptyRow from "../components/EmptyRow";
import RemarkTag from "../components/RemarkTag";
import { formatDate, isOverspeed } from "../utils/helpers";
import { subscribeToLiveLogs } from "../utils/firebase";

// Today's date as YYYY-MM-DD in the device's local time
// (not toISOString, which uses UTC and can be off by a day in the Philippines)
const getToday = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};

// Converts an event's date to YYYY-MM-DD so it can be compared with today
const normalizeDate = (value) => {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (isNaN(d)) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};

export default function RealtimeLogsScreen({ threshold = 30 }) {
  const [liveEvents, setLiveEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newestFirst, setNewestFirst] = useState(true);
  const [today, setToday] = useState(getToday());

  useEffect(() => {
    const unsubscribe = subscribeToLiveLogs((data) => {
      setLiveEvents(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Re-check the date every minute so the list resets at midnight
  useEffect(() => {
    const timer = setInterval(() => setToday(getToday()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Keep only today's logs, then sort by time
  const todaysEvents = useMemo(() => {
    const list = liveEvents.filter(
      (event) => normalizeDate(event.event_date) === today
    );
    list.sort((a, b) => {
      const cmp = String(a.event_time).localeCompare(String(b.event_time));
      return newestFirst ? -cmp : cmp;
    });
    return list;
  }, [liveEvents, today, newestFirst]);

  return (
    <div>
      <PageTitle
        title="Real-Time Traffic Logs"
        subtitle={`Detections recorded today, ${formatDate(today)}.`}
      />

      <div className="flex items-center gap-2 mb-3">
        <span className="h-2 w-2 rounded-full bg-green-600 inline-block animate-pulse" />
        <span className="text-sm text-gray-600">
          {loading
            ? "Connecting to Firebase..."
            : "Receiving data. Click the Time header to reverse the order."}
        </span>
        <span className="text-sm text-gray-500 ml-auto">
          {todaysEvents.length} log{todaysEvents.length === 1 ? "" : "s"} today
        </span>
      </div>

      <div className="border border-gray-300 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="px-3 py-2 text-left font-medium text-gray-700">
                Date
              </th>
              <th
                onClick={() => setNewestFirst((value) => !value)}
                className="px-3 py-2 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-200 select-none"
              >
                Time{newestFirst ? " ▼" : " ▲"}
              </th>
              {["Speed (km/h)", "Alert Triggered", "Remarks"].map((header) => (
                <th key={header} className="px-3 py-2 text-left font-medium text-gray-700">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {todaysEvents.length === 0 ? (
              <EmptyRow
                colSpan={5}
                message={loading ? "Loading live data..." : "No detections yet today. Waiting for incoming logs."}
              />
            ) : (
              todaysEvents.map((event) => {
                const over = isOverspeed(event.speed, threshold);

                return (
                  <tr key={event.event_id} className={`border-b border-gray-200 last:border-b-0 ${over ? "bg-red-50" : ""}`}>
                    <td className="px-3 py-2">{formatDate(event.event_date)}</td>
                    <td className="px-3 py-2">{event.event_time}</td>
                    <td className={`px-3 py-2 font-medium ${over ? "text-red-700 font-bold" : ""}`}>
                      {event.speed.toFixed(2)}
                    </td>
                    <td className="px-3 py-2">{over ? "Yes" : "No"}</td>
                    <td className="px-3 py-2">
                      <RemarkTag over={over} />
                    </td>
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