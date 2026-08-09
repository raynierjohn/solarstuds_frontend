import { CALENDAR_YEAR, DEFAULT_THRESHOLD } from "./constants";
import { mulberry32, pad, isOverspeed } from "../utils/helpers";

export function buildMockEvents() {
  const rand = mulberry32(20260326);
  const events = [];
  let eventId = 1;

  for (let month = 0; month < 8; month++) {
    const daysInMonth = new Date(CALENDAR_YEAR, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      if (rand() > 0.45) continue;

      const count = 4 + Math.floor(rand() * 14);

      for (let i = 0; i < count; i++) {
        const peak = rand() < 0.5 ? 7 : 12;
        const hour = Math.min(
          22,
          Math.max(5, peak + Math.floor(rand() * 6) - 1)
        );
        const minute = Math.floor(rand() * 60);
        const second = Math.floor(rand() * 60);

        const base = 22 + rand() * 30;
        const speed = Math.round(base * 100) / 100;

        events.push({
          event_id: eventId++,
          stud_id: rand() < 0.5 ? "SDS-01" : "SDS-02",
          speed,
          event_date: `${CALENDAR_YEAR}-${pad(month + 1)}-${pad(day)}`,
          event_time: `${pad(hour)}:${pad(minute)}:${pad(second)}`,
          overspeed_flag: isOverspeed(speed, DEFAULT_THRESHOLD),
        });
      }
    }
  }

  events.sort((a, b) =>
    (a.event_date + a.event_time).localeCompare(b.event_date + b.event_time)
  );

  return events;
}

export const INITIAL_EVENTS = buildMockEvents();

export const INITIAL_STUDS = [
  {
    stud_id: "SDS-01",
    type: "Speed Detection Stud",
    location: "Patag, Entry Point",
    status: "Active",
    speed_threshold: DEFAULT_THRESHOLD,
  },
  {
    stud_id: "SDS-02",
    type: "Speed Detection Stud",
    location: "Patag, Exit Point (50 m)",
    status: "Active",
    speed_threshold: DEFAULT_THRESHOLD,
  },
  {
    stud_id: "ZLS-01",
    type: "Zebra Lane Stud",
    location: "Patag, Crosswalk (Left)",
    status: "Active",
    speed_threshold: DEFAULT_THRESHOLD,
  },
  {
    stud_id: "ZLS-02",
    type: "Zebra Lane Stud",
    location: "Patag, Crosswalk (Right)",
    status: "Fail-Safe",
    speed_threshold: DEFAULT_THRESHOLD,
  },
];

export const ADMIN = {
  admin_id: 1,
  username: "admin",
  password: "admin123",
  email: "admin@ustp.edu.ph",
  role: "System Administrator",
};
