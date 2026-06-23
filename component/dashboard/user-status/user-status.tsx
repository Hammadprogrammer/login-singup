"use client";

import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import UserDetailModal from "./user-detail-modal";
import AddUserModal from "./add-user-modal";

export default function UserStatus() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/dashboard/user-stats");
      if (!res.ok) {
        setData({ totalUsers: 0, todayUsers: 0, recentUsers: [] });
        return;
      }
      const text = await res.text();
      const data = text ? JSON.parse(text) : { totalUsers: 0, todayUsers: 0, recentUsers: [] };
      setData(data);
    } catch (err) {
      console.error(err);
      setData({ totalUsers: 0, todayUsers: 0, recentUsers: [] });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteUser = async (userId: number) => {
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
      <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            <span className="text-blue-500">👥</span> User Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage and monitor registered user accounts and system access.
          </p>
        </div>
        <button
          onClick={() => setShowAddUser(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-blue-500/20"
        >
          <UserPlus size={18} />
          Add User
        </button>
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
                <th className="px-6 py-4 font-bold text-center">Role</th>
                <th className="px-6 py-4 font-bold text-center">Listings</th>
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
                    {user.role === "ADMIN" ? (
                      <span className="px-3 py-1 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">ADMIN</span>
                    ) : user.role === "SUBADMIN" ? (
                      <span className="px-3 py-1 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">SUBADMIN</span>
                    ) : (
                      <span className="px-3 py-1 rounded-md text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700/50">USER</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-slate-400 text-xs">
                    {user._count?.products ?? 0} listed
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedUserId(user.id)}
                        className="px-3 py-1 rounded-md text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white"
                      >
                        Details
                      </button>
                      <button
                        disabled={deleting === user.id || user.role === "ADMIN" || user.role === "SUBADMIN"}
                        onClick={() => handleDeleteUser(user.id)}
                        className={`px-3 py-1 rounded-md text-xs font-semibold ${
                          user.role === "ADMIN" || user.role === "SUBADMIN"
                            ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                            : deleting === user.id
                            ? "bg-red-700 text-white cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-500 text-white"
                        }`}
                      >
                        {deleting === user.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
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

      {selectedUserId !== null && (
        <UserDetailModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}

      {showAddUser && (
        <AddUserModal
          onClose={() => setShowAddUser(false)}
          onCreated={fetchData}
        />
      )}
    </div>
  );
}