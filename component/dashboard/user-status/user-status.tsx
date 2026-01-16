"use client";

import { useEffect, useState } from "react";

export default function UserStatus() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/dashboard/user-stats");
      const data = await res.json();
      setData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      setDeleting(userId);
      const res = await fetch("/api/dashboard/delete-user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId }),
      });

      if (!res.ok) throw new Error("Failed to delete user");

      setData((prev: any) => ({
        ...prev,
        totalUsers: prev.totalUsers - 1,
        recentUsers: prev.recentUsers.filter((u: any) => u.id !== userId),
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to delete user.");
    } finally {
      setDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-slate-900 text-blue-400">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium">Loading User Directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-950 min-h-screen text-slate-200">
      {/* Heading */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          <span className="text-blue-500">👥</span> User Management
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage and monitor registered user accounts and system access.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-1 bg-blue-600"></div>
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Total Registered Users</p>
          <h2 className="text-4xl font-bold text-white mt-2">{data.totalUsers}</h2>
          <p className="text-[10px] text-slate-600 mt-1 font-medium underline decoration-slate-700">Database records</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-1 bg-green-500"></div>
          <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">New Users Today</p>
          <h2 className="text-4xl font-bold text-white mt-2">{data.todayUsers}</h2>
          <p className="text-[10px] text-slate-600 mt-1 font-medium underline decoration-slate-700">Joined in last 24h</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-1 bg-yellow-500"></div>
          <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">System Status</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Online</h2>
          </div>
          <p className="text-[10px] text-slate-600 mt-1 font-medium">API connection status</p>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="bg-slate-900/50 p-5 border-b border-slate-800 flex items-center gap-2">
          <span className="text-blue-400 text-lg">📋</span>
          <h2 className="text-lg font-semibold text-white">Recent Registrations ({data.recentUsers.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-950/50 border-b border-slate-800">
                <th className="px-6 py-4 font-bold">User Name</th>
                <th className="px-6 py-4 font-bold">User ID</th>
                <th className="px-6 py-4 font-bold">Email Address</th>
                <th className="px-6 py-4 font-bold">Joined Date</th>
                <th className="px-6 py-4 font-bold text-center">Reset Code</th>
                <th className="px-6 py-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {data.recentUsers.map((user: any) => (
                <tr key={user.id} className="hover:bg-slate-800/30 transition-all group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs uppercase">
                        {(user.name || user.email)[0]}
                      </div>
                      <span className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {user.name || "Unknown User"}
                      </span>
                    </div>
                  </td>
                  {/* NEW USER ID COLUMN */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-[10px] px-2 py-1 bg-slate-800 text-slate-400 rounded border border-slate-700 font-mono">
                      {user.id}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{user.email}</td>

                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {user.resetCode ? (
                      <span className="px-3 py-1 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">ACTIVE</span>
                    ) : (
                      <span className="px-3 py-1 rounded-md text-[10px] font-bold bg-slate-800 text-slate-600 border border-slate-700/50">NONE</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      disabled={deleting === user.id}
                      onClick={() => handleDeleteUser(user.id)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold ${
                        deleting === user.id ? "bg-red-700 text-white cursor-not-allowed" : "bg-red-600 hover:bg-red-500 text-white"
                      }`}
                    >
                      {deleting === user.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.recentUsers.length === 0 && (
          <div className="p-10 text-center text-slate-600 text-sm">
            No user records found in the database.
          </div>
        )}
      </div>
    </div>
  );
}