import { useCallback, useEffect, useState } from "react";

import LoginScreen from "./screens/LoginScreen";
import SpeedMonitoringScreen from "./screens/SpeedMonitoringScreen";
import SpeedRecordsScreen from "./screens/SpeedRecordsScreen";
import RealtimeLogsScreen from "./screens/RealtimeLogsScreen";
import OverspeedingScreen from "./screens/OverspeedingScreen";
import AnalyticsScreen from "./screens/AnalyticsScreen";
import StudStatusScreen from "./screens/StudStatusScreen";
import GraphScreen from "./screens/GraphScreen";

import { ADMIN, INITIAL_EVENTS, INITIAL_STUDS } from "./data/mockData";
import { NAV } from "./data/constants";
import { isOverspeed, pad } from "./utils/helpers";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("monitoring");
  const [selectedDate, setSelectedDate] = useState("2026-03-26");
  const [studs, setStuds] = useState(INITIAL_STUDS);
  const [events] = useState(INITIAL_EVENTS);
  const [liveEvents, setLiveEvents] = useState(() =>
    [...INITIAL_EVENTS].slice(-20).reverse()
  );

  const threshold = studs[0]?.speed_threshold ?? 30;

  useEffect(() => {
    if (!loggedIn) return undefined;

    const intervalId = setInterval(() => {
      const now = new Date();
      const speed = Math.round((20 + Math.random() * 32) * 100) / 100;

      setLiveEvents((previous) => {
        const nextEvent = {
          event_id: 900000 + Date.now(),
          stud_id: Math.random() < 0.5 ? "SDS-01" : "SDS-02",
          speed,
          event_date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
          event_time: `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
          overspeed_flag: isOverspeed(speed, threshold),
        };

        return [nextEvent, ...previous].slice(0, 40);
      });
    }, 6000);

    return () => clearInterval(intervalId);
  }, [loggedIn, threshold]);

  const updateStud = useCallback((id, patch) => {
    setStuds((previous) =>
      previous.map((stud) =>
        stud.stud_id === id ? { ...stud, ...patch } : stud
      )
    );
  }, []);

  if (!loggedIn) {
    return <LoginScreen onLogin={() => setLoggedIn(true)} />;
  }

  const renderPage = () => {
    switch (page) {
      case "monitoring":
        return (
          <SpeedMonitoringScreen
            events={events}
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setPage("records");
            }}
          />
        );

      case "records":
        return (
          <SpeedRecordsScreen
            events={events}
            selectedDate={selectedDate}
            threshold={threshold}
          />
        );

      case "realtime":
        return (
          <RealtimeLogsScreen
            liveEvents={liveEvents}
            threshold={threshold}
          />
        );

      case "overspeeding":
        return <OverspeedingScreen events={events} threshold={threshold} />;

      case "analytics":
        return <AnalyticsScreen events={events} threshold={threshold} />;

      case "studs":
        return <StudStatusScreen studs={studs} onUpdateStud={updateStud} />;

      case "graph":
        return (
          <GraphScreen
            events={events}
            selectedDate={selectedDate}
            threshold={threshold}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-300">
        <div className="px-4 py-3 flex flex-wrap items-center gap-3">
          <div className="mr-auto">
            <h1 className="text-base font-semibold text-gray-900">
              Speed Monitoring System
            </h1>
            <p className="text-xs text-gray-500">
              IoT-Enabled Solar Studs at Patag, Cagayan de Oro City
            </p>
          </div>

          <span className="text-sm text-gray-600">
            {ADMIN.username} · {ADMIN.role}
          </span>

          <button
            onClick={() => setLoggedIn(false)}
            className="text-sm px-3 py-1 border border-gray-300 hover:bg-gray-100"
          >
            Log out
          </button>
        </div>

        <nav className="px-4 flex flex-wrap gap-1 border-t border-gray-200">
          {NAV.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPage(key)}
              className={`text-sm px-3 py-2 border-b-2 ${
                page === key
                  ? "border-gray-900 text-gray-900 font-medium"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="p-4 max-w-6xl mx-auto">
        {renderPage()}
      </main>
    </div>
  );
}
