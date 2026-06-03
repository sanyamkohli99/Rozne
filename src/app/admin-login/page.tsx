"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        router.push("/admin");
      } else {
        setError("Incorrect password. Try again.");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 p-8 border border-border rounded-2xl shadow-sm">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold">Admin Access</h1>
          <p className="text-sm text-muted-foreground">Enter your admin password</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full border border-border rounded-lg px-4 py-3 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground"
            autoFocus
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading || !token}
            className="w-full bg-foreground text-background rounded-full py-3 text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-40"
          >
            {loading ? "Checking…" : "Enter admin panel"}
          </button>
        </form>
      </div>
    </div>
  );
}
