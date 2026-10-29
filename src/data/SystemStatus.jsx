import React, { useEffect, useState } from "react";
import { ref, onValue } from "../utils/firebase/database";
import { database } from "../utils/firebase";

const SystemStatus = () => {
  const [statuses, setStatuses] = useState({});

  useEffect(() => {
    const statusRef = ref(database, "SystemStatus");

    const unsubscribe = onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStatuses(data);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h3>Solar Stud System Status</h3>
      <div style={{ display: "flex", gap: "20px" }}>
        {Object.keys(statuses).map((key) => {
          const device = statuses[key];
          const isMalfunctioned = device.status === "MALFUNCTIONED";

          return (
            <div
              key={key}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "15px",
                backgroundColor: isMalfunctioned ? "#ffe6e6" : "#e6ffe6",
                minWidth: "220px",
              }}
            >
              <h4>{device.device_name || key}</h4>
              <p>
                <strong>Status: </strong>
                <span style={{ color: isMalfunctioned ? "red" : "green", fontWeight: "bold" }}>
                  {device.status}
                </span>
              </p>
              {device.error_details && <p><small>Error: {device.error_details}</small></p>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SystemStatus;