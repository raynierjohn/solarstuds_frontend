import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import { getFirestore, collection, onSnapshot, query, orderBy, getCountFromServer, collectionGroup } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const rtdb = getDatabase(app);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Realtime Listener for Live RTDB Traffic Logs
export const subscribeToLiveLogs = (callback) => {
  const logsRef = ref(rtdb, "TrafficLogs");
  return onValue(logsRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }
    const parsed = Object.keys(data).map((key, index) => ({
      event_id: key,
      event_date: data[key].date || "N/A",
      event_time: data[key].time || "N/A",
      speed: Number(data[key].speed) || 0,
      stud_id: "STUD-02",
      alert_triggered: data[key].alert_triggered || false,
      overspeed_flag: data[key].overspeed_flag || false,
      formatted_datetime: data[key].formatted_datetime || ""
    }));
    // Reverse so latest incoming logs appear at top
    callback(parsed.reverse());
  });
};

// Realtime Listener for Stud Status Node in RTDB
export const subscribeToStudStatus = (callback) => {
  const statusRef = ref(rtdb, "SystemStatus");
  return onValue(statusRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }
    const parsedStuds = Object.keys(data).map((key) => ({
      stud_id: key,
      name: data[key].device_name || key,
      status: data[key].status || "Not Working",
      error_details: data[key].error_details || "None",
      last_ping: data[key].last_ping || null,
      ip_address: data[key].ip_address || "N/A",
      type: key.includes("STUD_2") ? "Speed Detection Hub" : "Speed Detection Node",
      location: "Patag Road"
    }));
    callback(parsedStuds);
  });
};

// Realtime Listener for Firestore Date Subcollections
export const subscribeToFirestoreDateLogs = (dateStr, callback) => {
  // Path: TrafficLogs / {YYYY-MM-DD} / Logs
  const logsCollectionRef = collection(db, "TrafficLogs", dateStr, "Logs");
  
  return onSnapshot(logsCollectionRef, (snapshot) => {
    const logs = snapshot.docs.map((doc) => ({
      event_id: doc.id,
      event_date: doc.data().date || dateStr,
      event_time: doc.data().time || "N/A",
      speed: Number(doc.data().speed) || 0,
      stud_id: "STUD-02",
      overspeed_flag: doc.data().overspeed_flag || false,
      alert_triggered: doc.data().alert_triggered || false
    }));
    callback(logs);
  });
};

export const fetchMonthCounts = async (year, monthIndex) => {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const mm = String(monthIndex + 1).padStart(2, "0");

  const entries = await Promise.all(
    Array.from({ length: daysInMonth }, async (_, i) => {
      const iso = `${year}-${mm}-${String(i + 1).padStart(2, "0")}`;
      try {
        const snap = await getCountFromServer(collection(db, "TrafficLogs", iso, "Logs"));
        return [iso, snap.data().count];
      } catch (err) {
        console.error("Count failed for", iso, err);
        return [iso, 0];
      }
    })
  );

  return Object.fromEntries(entries);
};

// Realtime listener for ALL Firestore logs: TrafficLogs/{YYYY-MM-DD}/Logs
export const subscribeToAllFirestoreLogs = (callback, onError) => {
  return onSnapshot(
    collectionGroup(db, "Logs"),
    (snapshot) => {
      const logs = snapshot.docs.map((d) => {
        const data = d.data();
        const dateFromPath = d.ref.parent.parent?.id || "N/A"; // the YYYY-MM-DD parent doc id
        return {
          event_id: d.id,
          unique_key: d.ref.path,
          event_date: data.date || dateFromPath,
          event_time: data.time || "N/A",
          speed: Number(data.speed) || 0,
          stud_id: "STUD-02",
          overspeed_flag: data.overspeed_flag || false,
          alert_triggered: data.alert_triggered || false,
        };
      });

      // newest first
      logs.sort((a, b) =>
        (b.event_date + b.event_time).localeCompare(a.event_date + a.event_time)
      );
      callback(logs);
    },
    (err) => {
      console.error("Firestore logs error:", err);
      if (onError) onError(err);
      callback([]);
    }
  );
};