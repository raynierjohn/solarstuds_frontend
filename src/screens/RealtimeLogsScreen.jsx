import { useEffect, useMemo, useState } from "react";
import PageTitle from "../components/PageTitle";
import EmptyRow from "../components/EmptyRow";
import RemarkTag from "../components/RemarkTag";
import { formatDate, isOverspeed } from "../utils/helpers";
import { subscribeToLiveLogs } from "../utils/firebase";

export default function RealtimeLogsScreen({ threshold = 30 }) {
  const [liveEvents, setLiveEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newestFirst, setNewestFirst] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToLiveLogs((data) => {
      setLiveEvents(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sort by date, then by time within the same date
  const sortedEvents = useMemo(() => {
    const list = [...liveEvents];
    list.sort((a, b) => {
      const cmp = `${a.event_date} ${a.event_time}`.localeCompare(
        `${b.event_date} ${b.event_time}`
      );
      return newestFirst ? -cmp : cmp;
    });
    return list;
  }, [liveEvents, newestFirst]);

  return (
    <div>
      <PageTitle
        title="Real-Time Traffic Logs"
        subtitle="Detections streamed from the deployed studs as they are recorded."
      />

      <div className="flex items-center gap-2 mb-3">
        <span className="h-2 w-2 rounded-full bg-green-600 inline-block animate-pulse" />
        <span className="text-sm text-gray-600">
          {loading
            ? "Connecting to Firebase..."
            : "Receiving data. Sorted by date. Click the Date header to reverse the order."}
        </span>
      </div>

      <div className="border border-gray-300 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th
                onClick={() => setNewestFirst((value) => !value)}
                className="px-3 py-2 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-200 select-none"
              >
                Date{newestFirst ? " ▼" : " ▲"}
              </th>
              {["Time", "Speed (km/h)", "Alert Triggered", "Remarks"].map((header) => (
                <th key={header} className="px-3 py-2 text-left font-medium text-gray-700">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {sortedEvents.length === 0 ? (
              <EmptyRow colSpan={5} message={loading ? "Loading live data..." : "Waiting for incoming detections."} />
            ) : (
              sortedEvents.map((event) => {
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