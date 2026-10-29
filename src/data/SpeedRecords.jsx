import React, { useEffect, useState } from "react";
import { ref, onValue } from "../utils/firebase/database";
import { database } from "../utils/firebase"; // Adjust path if needed

const SpeedRecords = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Point reference to 'TrafficLogs' node in Firebase
    const logsRef = ref(database, "TrafficLogs");

    // 2. Subscribe to real-time changes
    const unsubscribe = onValue(logsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Firebase returns an object of objects; convert to array
        const parsedLogs = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        // Sort logs descending (latest first)
        parsedLogs.reverse();
        setLogs(parsedLogs);
      } else {
        setLogs([]);
      }
      setLoading(false);
    });

    // Clean up listener on unmount
    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading real-time logs...</div>;

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>Speed Monitoring System</h2>
      <div style={{ background: "#222", color: "#fff", padding: "10px", borderRadius: "5px" }}>
        <strong>Speed Limit: 30 km/h</strong>
      </div>

      <table style={{ width: "100%", marginTop: "15px", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#111", color: "#fff", textAlign: "left" }}>
            <th style={{ padding: "10px" }}>Date</th>
            <th style={{ padding: "10px" }}>Time</th>
            <th style={{ padding: "10px" }}>Formatted DateTime</th>
            <th style={{ padding: "10px" }}>Speed (km/h)</th>
            <th style={{ padding: "10px" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => {
            const isOverspeed = log.overspeed_flag || log.speed > 30;
            return (
              <tr
                key={log.id}
                style={{
                  backgroundColor: isOverspeed ? "#ff3333" : "#f4f4f4", // Highlights overspeeding in red
                  color: isOverspeed ? "#ffffff" : "#000000",
                  borderBottom: "1px solid #ccc",
                  fontWeight: isOverspeed ? "bold" : "normal"
                }}
              >
                <td style={{ padding: "10px" }}>{log.date || "N/A"}</td>
                <td style={{ padding: "10px" }}>{log.time || "N/A"}</td>
                <td style={{ padding: "10px" }}>{log.formatted_datetime || "N/A"}</td>
                <td style={{ padding: "10px" }}>{log.speed}</td>
                <td style={{ padding: "10px" }}>
                  {isOverspeed ? "OVERSPEEDING" : "NORMAL"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SpeedRecords;