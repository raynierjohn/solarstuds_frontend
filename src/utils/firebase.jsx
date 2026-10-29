import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import { getFirestore, collection, onSnapshot, query, orderBy } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD7IZnc5HQLfDVs7gEgXQUP7jojRDidQoU",
  authDomain: "solarstuds-3fd0c.firebaseapp.com",
  databaseURL: "https://solarstuds-3fd0c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "solarstuds-3fd0c",
  storageBucket: "solarstuds-3fd0c.firebasestorage.app",
  messagingSenderId: "267001520479",
  appId: "1:267001520479:web:45d6c8a44b052bd5a116ea"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const rtdb = getDatabase(app);
export const db = getFirestore(app);

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