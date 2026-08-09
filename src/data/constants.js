export const DEFAULT_THRESHOLD = 30;
export const CALENDAR_YEAR = 2026;

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const MONTH_OPTIONS = MONTHS.slice(0, 8).map((name, index) => ({
  value: String(index + 1).padStart(2, "0"),
  label: `${name} ${CALENDAR_YEAR}`,
}));

export const NAV = [
  ["monitoring", "Speed Monitoring"],
  ["records", "Speed Records"],
  ["realtime", "Real-Time Logs"],
  ["overspeeding", "Overspeeding Events"],
  ["analytics", "Analytics"],
  ["studs", "Solar Stud Status"],
  ["graph", "Graph"],
];
