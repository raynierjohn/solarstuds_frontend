import { useEffect, useState } from "react";
import PageTitle from "../components/PageTitle";
import StatCard from "../components/StatCard";
import { subscribeToStudStatus } from "../utils/firebase";

export default function StudStatusScreen() {
  const [studs, setStuds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToStudStatus((data) => {
      setStuds(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const stats = studs.reduce(
    (acc, stud) => {
      acc.total += 1;
      if (stud.status === "ACTIVE") acc.active += 1;
      else if (stud.status === "FAIL_SAFE") acc.failSafe += 1;
      else acc.notWorking += 1;

      return acc;
    },
    { total: 0, active: 0, failSafe: 0, notWorking: 0 }
  );

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
        <StatCard label="Not working" value={stats.notWorking} note="No response / Malfunctioned" />
      </div>

      <div className="border border-gray-300 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              {["Device Name", "Type", "Location", "Status", "IP Address", "Error Details"].map((header) => (
                <th key={header} className="px-3 py-2 text-left font-medium text-gray-700">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  Fetching hardware status from Firebase...
                </td>
              </tr>
            ) : studs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No system status pings received yet.
                </td>
              </tr>
            ) : (
              studs.map((stud) => {
                const isMalfunction = stud.status === "MALFUNCTIONED" || stud.status === "Not Working";

                return (
                  <tr key={stud.stud_id} className="border-b border-gray-200 last:border-b-0">
                    <td className="px-3 py-2 font-medium text-gray-800">{stud.name}</td>
                    <td className="px-3 py-2">{stud.type}</td>
                    <td className="px-3 py-2">{stud.location}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${
                          stud.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : isMalfunction
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {stud.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-600">{stud.ip_address}</td>
                    <td className="px-3 py-2 text-gray-500">{stud.error_details}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="border border-gray-300 bg-white p-4 mt-6">
        <p className="text-sm font-medium text-gray-800 mb-2">
          LED Indicator Guide
        </p>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>
            <span className="text-gray-900 font-medium">White (steady)</span>:
            Vehicle within the speed limit; standard path guidance during low light.
          </li>
          <li>
            <span className="text-red-700 font-medium">Red (flashing)</span>:
            Overspeeding vehicle detected; warns drivers and pedestrians.
          </li>
          <li>
            <span className="text-yellow-700 font-medium">Yellow (slow pulse)</span>:
            Fail-safe mode; sensor, network, or battery fault detected.
          </li>
        </ul>
      </div>
    </div>
  );
}