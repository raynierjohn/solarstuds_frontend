import PageTitle from "../components/PageTitle";
import EmptyRow from "../components/EmptyRow";
import RemarkTag from "../components/RemarkTag";
import { formatDate, isOverspeed } from "../utils/helpers";

export default function RealtimeLogsScreen({ liveEvents, threshold }) {
  return (
    <div>
      <PageTitle
        title="Real-Time Traffic Logs"
        subtitle="Detections streamed from the deployed studs as they are recorded."
      />

      <div className="flex items-center gap-2 mb-3">
        <span className="h-2 w-2 rounded-full bg-green-600 inline-block" />
        <span className="text-sm text-gray-600">
          Receiving data. New detections appear at the top.
        </span>
      </div>

      <div className="border border-gray-300 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              {["Log ID", "Date", "Time", "Speed (km/h)", "Stud ID", "Alert Triggered", "Remarks"].map((header) => (
                <th key={header} className="px-3 py-2 text-left font-medium text-gray-700">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {liveEvents.length === 0 ? (
              <EmptyRow colSpan={7} message="Waiting for incoming detections." />
            ) : (
              liveEvents.map((event) => {
                const over = isOverspeed(event.speed, threshold);

                return (
                  <tr key={event.event_id} className="border-b border-gray-200 last:border-b-0">
                    <td className="px-3 py-2 text-gray-600">LOG-{event.event_id}</td>
                    <td className="px-3 py-2">{formatDate(event.event_date)}</td>
                    <td className="px-3 py-2">{event.event_time}</td>
                    <td className="px-3 py-2">{event.speed.toFixed(2)}</td>
                    <td className="px-3 py-2 text-gray-600">{event.stud_id}</td>
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
