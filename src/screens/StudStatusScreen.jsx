import { useMemo } from "react";
import PageTitle from "../components/PageTitle";
import StatCard from "../components/StatCard";

export default function StudStatusScreen({ studs, onUpdateStud }) {
  const { total, active, failSafe, notWorking } = useMemo(
    () =>
      studs.reduce(
        (acc, stud) => {
          acc.total += 1;

          if (stud.status === "Active") acc.active += 1;
          else if (stud.status === "Fail-Safe") acc.failSafe += 1;
          else if (stud.status === "Not Working") acc.notWorking += 1;

          return acc;
        },
        { total: 0, active: 0, failSafe: 0, notWorking: 0 }
      ),
    [studs]
  );

  return (
    <div>
      <PageTitle
        title="Solar Stud Status"
        subtitle="Health of every deployed stud, with the speed threshold used for overspeed detection."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total studs" value={total} />
        <StatCard label="Active" value={active} note="Operating normally" />
        <StatCard
          label="Fail-safe mode"
          value={failSafe}
          note="Yellow LED, needs inspection"
        />
        <StatCard label="Not working" value={notWorking} note="No response" />
      </div>

      <div className="border border-gray-300 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              {["Stud ID", "Type", "Location", "Status", "Speed threshold (km/h)"].map((header) => (
                <th key={header} className="px-3 py-2 text-left font-medium text-gray-700">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {studs.map((stud) => (
              <tr key={stud.stud_id} className="border-b border-gray-200 last:border-b-0">
                <td className="px-3 py-2 text-gray-600">{stud.stud_id}</td>
                <td className="px-3 py-2">{stud.type}</td>
                <td className="px-3 py-2">{stud.location}</td>
                <td className="px-3 py-2">
                  <select
                    value={stud.status}
                    onChange={(event) =>
                      onUpdateStud(stud.stud_id, { status: event.target.value })
                    }
                    className="border border-gray-300 px-2 py-1 text-sm"
                  >
                    <option>Active</option>
                    <option>Fail-Safe</option>
                    <option>Not Working</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min="1"
                    value={stud.speed_threshold}
                    onChange={(event) =>
                      onUpdateStud(stud.stud_id, {
                        speed_threshold: Number(event.target.value) || 0,
                      })
                    }
                    className="w-24 border border-gray-300 px-2 py-1 text-sm"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border border-gray-300 bg-white p-4 mt-6">
        <p className="text-sm font-medium text-gray-800 mb-2">
          LED indicator guide
        </p>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>
            <span className="text-gray-900 font-medium">White (steady)</span>:
            vehicle within the speed limit; standard path guidance during low light.
          </li>
          <li>
            <span className="text-red-700 font-medium">Red (flashing)</span>:
            overspeeding vehicle detected; warns drivers and pedestrians.
          </li>
          <li>
            <span className="text-yellow-700 font-medium">Yellow (slow pulse)</span>:
            fail-safe mode; sensor, network, or battery fault detected.
          </li>
        </ul>
      </div>
    </div>
  );
}
