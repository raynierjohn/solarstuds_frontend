import { useState } from "react";
import { loginWithUsername } from "../utils/auth";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginWithUsername(username, password);
      // No redirect needed: onAuthStateChanged in App.jsx handles it.
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white border border-gray-300 p-6"
      >
        <h1 className="text-base font-semibold text-gray-900">
          Speed Monitoring System
        </h1>

        <label className="block text-sm text-gray-700 mb-1">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          autoFocus
          className="w-full border border-gray-300 px-3 py-2 text-sm mb-4 focus:outline-none focus:border-gray-900"
        />

        <label className="block text-sm text-gray-700 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="w-full border border-gray-300 px-3 py-2 text-sm mb-4 focus:outline-none focus:border-gray-900"
        />

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full text-sm px-3 py-2 border border-gray-300 bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Log in"}
        </button>
      </form>
    </div>
  );
}