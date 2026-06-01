"use client";

import { useState } from "react";
import { 
  LayoutDashboard, 
  Package, 
  ImageIcon, 
  Users, 
  ShieldCheck,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";

// Import tabs
import OverviewTab from "./tabs/overview-tab";
import KYCTab from "./tabs/kyc-tab";
import { HomeSliderCRUD } from "./homeSlider/slider";
import ProductDashboard from "./product/product";
import UserStatus from "./user-status/user-status";

type TabKey = "overview" | "products" | "sliders" | "users" | "kyc";

const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "products", label: "Products", icon: Package },
  { key: "sliders", label: "Home Sliders", icon: ImageIcon },
  { key: "users", label: "Users", icon: Users },
  { key: "kyc", label: "KYC", icon: ShieldCheck },
];

export default function DashboardClient() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabKey);
    setMobileMenuOpen(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab onTabChange={handleTabChange} />;
      case "products":
        return <ProductDashboard />;
      case "sliders":
        return <HomeSliderCRUD />;
      case "users":
        return <UserStatus />;
      case "kyc":
        return <KYCTab />;
      default:
        return <OverviewTab onTabChange={handleTabChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120]">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 w-full bg-[#0f172a] border-b border-slate-800 shadow-xl">
        <div className="mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <LayoutDashboard className="text-amber-400 w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
                Admin Panel
              </h1>
            </div>

            {/* Desktop Logout */}
            <div className="hidden md:flex items-center">
              <button
                onClick={handleLogout}
                className="group flex items-center gap-2 bg-[#1e293b] hover:bg-red-950/40 border border-slate-700 hover:border-red-500/50 transition-all duration-300 text-slate-300 hover:text-red-400 px-4 py-2 rounded-xl shadow-md"
              >
                <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-semibold uppercase tracking-wide">Logout</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0f172a] border-t border-slate-800 p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === tab.key
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <tab.icon size={18} />
                <span className="font-semibold">{tab.label}</span>
              </button>
            ))}
            <div className="border-t border-slate-800 pt-2 mt-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-950/40 transition-all"
              >
                <LogOut size={18} />
                <span className="font-semibold">Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-[#0f172a] border-r border-slate-800 min-h-[calc(100vh-64px)] sticky top-16">
          <div className="p-4 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === tab.key
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <tab.icon size={18} />
                <span className="font-semibold">{tab.label}</span>
                {tab.key === "kyc" && (
                  <span className="ml-auto text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                    NEW
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-auto p-4 border-t border-slate-800">
            <div className="bg-[#161f32] rounded-xl p-4 border border-slate-800">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">System Status</p>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs text-emerald-400 font-bold">OPERATIONAL</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-h-[calc(100vh-64px)] overflow-auto">
          {/* Mobile Tab Bar */}
          <div className="md:hidden bg-[#0f172a] border-b border-slate-800 overflow-x-auto">
            <div className="flex p-2 gap-1 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    activeTab === tab.key
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 bg-slate-800/50"
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="animate-in fade-in duration-300">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
