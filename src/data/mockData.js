import { CALENDAR_YEAR, DEFAULT_THRESHOLD } from "./constants";
import { mulberry32, pad, isOverspeed } from "../utils/helpers";

export const INITIAL_EVENTS =[];

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


