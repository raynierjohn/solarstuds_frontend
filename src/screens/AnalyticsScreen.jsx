import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import PageTitle from "../components/PageTitle";
import StatCard from "../components/StatCard";
import { MONTHS } from "../data/constants";
import { getMonthKey, isOverspeed } from "../utils/helpers";

export default function AnalyticsScreen({ events, threshold }) {
  const stats = useMemo(() => {
    const total = events.length;
    const monthStats = Array.from({ length: 8 }, () => ({
      detections: 0,
      violations: 0,
    }));
    const hourViolations = {};

    let speedSum = 0;
    let violations = 0;

    events.forEach((event) => {
      speedSum += event.speed;

      const monthIndex = Number(getMonthKey(event.event_date)) - 1;
      if (monthIndex >= 0 && monthIndex < 8) {
        monthStats[monthIndex].detections += 1;

        if (isOverspeed(event.speed, threshold)) {
          monthStats[monthIndex].violations += 1;
        }
      }

      if (isOverspeed(event.speed, threshold)) {
        violations += 1;

        const hour = event.event_time.slice(0, 2);
        hourViolations[hour] = (hourViolations[hour] || 0) + 1;
      }
    });

    const avg = total === 0 ? 0 : speedSum / total;

    const byMonth = MONTHS.slice(0, 8).map((month, index) => ({
      month: month.slice(0, 3),
      ...monthStats[index],
    }));

    const hourData = Object.keys(hourViolations)
      .sort()
      .map((hour) => ({
        hour: `${hour}:00`,
        violations: hourViolations[hour],
      }));

    const peak = hourData.reduce(
      (best, current) =>
        !best || current.violations > best.violations ? current : best,
      null
    );

    return { total, violations, avg, byMonth, hourData, peak };
  }, [events, threshold]);

  const rate =
    stats.total === 0 ? 0 : (stats.violations / stats.total) * 100;

  return (
    <div>
      <PageTitle
        title="Analytics"
        subtitle="Summary of detections and overspeeding activity across all logged data."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <StatCard label="Total detections" value={stats.total} />
        <StatCard label="Violations" value={stats.violations} />
        <StatCard label="Violation rate" value={`${rate.toFixed(1)}%`} />
        <StatCard
          label="Average speed"
          value={`${stats.avg.toFixed(2)} km/h`}
          note={`Limit: ${threshold} km/h`}
        />
        <StatCard
          label="Peak violation hour"
          value={stats.peak ? stats.peak.hour : "N/A"}
          note={stats.peak ? `${stats.peak.violations} violations` : ""}
        />
      </div>

      <div className="border border-gray-300 bg-white p-4 mb-6">
        <p className="text-sm font-medium text-gray-800 mb-3">
          Detections and violations by month
        </p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.byMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="detections" name="Detections" />
              <Bar dataKey="violations" name="Violations" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="border border-gray-300 bg-white p-4">
        <p className="text-sm font-medium text-gray-800 mb-3">
          Violations by hour of day
        </p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.hourData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="violations" name="Violations" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
