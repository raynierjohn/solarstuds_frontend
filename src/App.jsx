import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import LoginScreen from "./screens/LoginScreen";
import SpeedMonitoringScreen from "./screens/SpeedMonitoringScreen";
import SpeedRecordsScreen from "./screens/SpeedRecordsScreen";
import RealtimeLogsScreen from "./screens/RealtimeLogsScreen";
import OverspeedingScreen from "./screens/OverspeedingScreen";
import AnalyticsScreen from "./screens/AnalyticsScreen";
import GraphScreen from "./screens/GraphScreen";
import StudStatusScreen from "./screens/StudStatusScreen";

import { NAV, DEFAULT_THRESHOLD } from "./data/constants";
import { subscribeToLiveLogs, auth } from "./utils/firebase";
import { logout } from "./utils/auth";

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [page, setPage] = useState("monitoring");
  const [selectedDate, setSelectedDate] = useState(null); // no date selected until the user picks one
  const [liveEvents, setLiveEvents] = useState([]);

  const threshold = DEFAULT_THRESHOLD;

  // Track Firebase login state (also keeps you logged in after a page refresh)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Real-time logs from the Realtime Database (only once logged in)
  useEffect(() => {
    if (!user) return undefined;

    const unsubscribe = subscribeToLiveLogs((data) => {
      setLiveEvents(data.slice(0, 40)); // data is already newest-first
    });

    return () => unsubscribe();
  }, [user]);

  // All hooks are above these early returns (required by React)
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-600">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const username = user.email ? user.email.split("@")[0] : "admin";

  const renderPage = () => {
    switch (page) {
      case "monitoring":
        return (
          <SpeedMonitoringScreen
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
        return <OverspeedingScreen threshold={threshold} />;

      case "analytics":
        return <AnalyticsScreen threshold={threshold} />;

      case "studs":
        return <StudStatusScreen />;

      case "graph":
        return (
          <GraphScreen
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
            {username} · System Administrator
          </span>

          <button
            onClick={logout}
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