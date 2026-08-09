import { useState } from "react";
import { ADMIN } from "../data/mockData";

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (username === ADMIN.username && password === ADMIN.password) {
      setError("");
      onLogin();
    } else {
      setError("Incorrect username or password. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm border border-gray-300 bg-white p-6">
        <h1 className="text-lg font-semibold text-gray-900">Speed Monitoring System</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          IoT-Enabled Solar Studs: Administrator Login
        </p>

        <label className="block text-sm text-gray-700 mb-1">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="w-full border border-gray-300 px-3 py-2 text-sm mb-4 focus:outline-none focus:border-gray-600"
        />

        <label className="block text-sm text-gray-700 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="w-full border border-gray-300 px-3 py-2 text-sm mb-4 focus:outline-none focus:border-gray-600"
        />

        {error && <p className="text-sm text-red-700 mb-3">{error}</p>}

        <button
          onClick={submit}
          className="w-full bg-gray-900 text-white text-sm py-2 hover:bg-gray-700"
        >
          Log in
        </button>

        <p className="text-xs text-gray-500 mt-4">
          Demo credentials: admin / admin123
        </p>
      </div>
    </div>
  );
}
