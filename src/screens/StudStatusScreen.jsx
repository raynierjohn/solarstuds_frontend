import { useEffect, useState } from "react";
import PageTitle from "../components/PageTitle";
import StatCard from "../components/StatCard";
import { subscribeToStudStatus } from "../utils/firebase";

const OFFLINE_AFTER_MS = 60 * 60 * 1000; // 1 hour

// Turns last_ping into milliseconds. Handles Unix seconds, Unix ms, and date strings.
const toMillis = (value) => {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number" || /^\d+(\.\d+)?$/.test(String(value).trim())) {
    const num = Number(value);
    return num < 1e12 ? num * 1000 : num; // seconds -> ms
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
};

// "Active", "ACTIVE", "Fail-Safe", "fail safe" -> "ACTIVE", "FAIL_SAFE"
const normalizeStatus = (status) =>
  String(status || "").trim().toUpperCase().replace(/[\s-]+/g, "_");

export default function StudStatusScreen() {
  const [studs, setStuds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const unsubscribe = subscribeToStudStatus((data) => {
      setStuds(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Re-check every 30 seconds so studs flip to offline even if no new data arrives
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Add a computed display status to each stud
  const studsWithStatus = studs.map((stud) => {
    const lastPing = toMillis(stud.last_ping);
    const isOffline = lastPing === null || now - lastPing > OFFLINE_AFTER_MS;

    return {
      ...stud,
      displayStatus: isOffline ? "OFFLINE" : normalizeStatus(stud.status),
      isOffline,
    };
  });

  const stats = studsWithStatus.reduce(
    (acc, stud) => {
      acc.total += 1;
      if (stud.isOffline) acc.offline += 1;
      else if (stud.displayStatus === "ACTIVE") acc.active += 1;
      else if (stud.displayStatus === "FAIL_SAFE") acc.failSafe += 1;

      return acc;
    },
    { total: 0, active: 0, failSafe: 0, offline: 0 }
  );

  const badgeClass = (stud) => {
    if (stud.isOffline) return "bg-gray-200 text-gray-700";
    if (stud.displayStatus === "ACTIVE") return "bg-green-100 text-green-800";
    if (stud.displayStatus === "FAIL_SAFE") return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div>
      <PageTitle
        title="Solar Stud Status"
        subtitle="Health of every deployed stud synced in real-time with Firebase hardware nodes."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total studs" value={stats.total} />
        <StatCard label="Active" value={stats.active} note="Operating normally" />
        <StatCard
          label="Fail-safe mode"
          value={stats.failSafe}
          note="Yellow LED, needs inspection"
        />
        <StatCard label="Offline" value={stats.offline} note="No update in over 1 hour" />
      </div>

      <div className="border border-gray-300 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              {["Device Name", "Type", "Status", "Error Details"].map((header) => (
                <th key={header} className="px-3 py-2 text-left font-medium text-gray-700">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500">
                  Fetching hardware status from Firebase...
                </td>
              </tr>
            ) : studsWithStatus.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500">
                  No system status pings received yet.
                </td>
              </tr>
            ) : (
              studsWithStatus.map((stud) => (
                <tr key={stud.stud_id} className="border-b border-gray-200 last:border-b-0">
                  <td className="px-3 py-2 font-medium text-gray-800">{stud.name}</td>
                  <td className="px-3 py-2">{stud.type}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${badgeClass(stud)}`}
                    >
                      {stud.displayStatus}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-500">
                    {stud.isOffline ? "No update in over 1 hour" : stud.error_details}
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