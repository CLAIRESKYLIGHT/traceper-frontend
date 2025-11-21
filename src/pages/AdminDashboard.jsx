import { useEffect, useState } from "react";
import API from "../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    projects: 0,
    barangays: 0,
    contractors: 0,
    officials: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        console.log("📊 Fetching dashboard statistics...");
        
        // Try to fetch from stats endpoint first
        try {
          const response = await API.get("/dashboard/stats");
          console.log("✅ Stats API response:", response);
          
          // Handle different response structures
          const statsData = response.data?.data || response.data || {};
          console.log("📈 Stats data:", statsData);
          
          setStats({
            projects: statsData.projects || 0,
            barangays: statsData.barangays || 0,
            contractors: statsData.contractors || 0,
            officials: statsData.officials || 0,
          });
        } catch (statsError) {
          // If stats endpoint fails, fetch from individual endpoints
          console.warn("⚠️ Stats endpoint failed, fetching individual counts:", statsError);
          
          const [projectsRes, barangaysRes, contractorsRes, officialsRes] = await Promise.allSettled([
            API.get("/projects"),
            API.get("/barangays"),
            API.get("/contractors"),
            API.get("/officials"),
          ]);
          
          const projects = projectsRes.status === "fulfilled" 
            ? (projectsRes.value.data?.data || projectsRes.value.data || []).length 
            : 0;
          const barangays = barangaysRes.status === "fulfilled" 
            ? (barangaysRes.value.data?.data || barangaysRes.value.data || []).length 
            : 0;
          const contractors = contractorsRes.status === "fulfilled" 
            ? (contractorsRes.value.data?.data || contractorsRes.value.data || []).length 
            : 0;
          const officials = officialsRes.status === "fulfilled" 
            ? (officialsRes.value.data?.data || officialsRes.value.data || []).length 
            : 0;
          
          console.log("📊 Individual counts:", { projects, barangays, contractors, officials });
          
          setStats({
            projects,
            barangays,
            contractors,
            officials,
          });
        }
      } catch (error) {
        console.error("❌ Error fetching dashboard stats:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Projects",
      value: stats.projects,
      icon: "🏗️",
      color: "blue",
      description: "Active projects",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Barangays",
      value: stats.barangays,
      icon: "🏠",
      color: "blue",
      description: "Covered areas",
      gradient: "from-blue-600 to-blue-700",
    },
    {
      title: "Contractors",
      value: stats.contractors,
      icon: "⚙️",
      color: "yellow",
      description: "Registered partners",
      gradient: "from-yellow-400 to-yellow-500",
    },
    {
      title: "Officials",
      value: stats.officials,
      icon: "👥",
      color: "blue",
      description: "Government officials",
      gradient: "from-blue-400 to-blue-500",
    },
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-8 min-h-screen">
        <div className="animate-pulse">
          <div className="card-modern">
            <div className="h-8 bg-gray-200 rounded-xl w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded-xl w-96"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="card-modern h-40 animate-shimmer"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 min-h-screen animate-fadeIn">
      {/* Modern Header */}
      <div className="card-modern bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 shadow-xl animate-slideDown">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-yellow-400/30 animate-float">
                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Administrative Dashboard</h1>
                <p className="text-blue-100 mt-1">Municipal Transparency & Project Management System</p>
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="glass-effect bg-white/10 backdrop-blur-md rounded-xl px-5 py-4 border border-white/20">
              <p className="text-xs text-blue-100 uppercase tracking-wide font-semibold">Last Updated</p>
              <p className="text-lg text-white font-bold mt-1">
                {new Date().toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Overview - Professional Cards */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-blue-600 rounded"></span>
          System Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <div
              key={card.title}
              className="card-modern group relative overflow-hidden animate-scaleIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient Background Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${card.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-3xl">{card.icon}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-700 font-semibold">Active</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{card.title}</p>
                  <p className="text-4xl font-bold gradient-text">
                    {card.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-3">{card.description}</p>
                </div>
              </div>
              
              {/* Animated progress bar */}
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${card.gradient} transition-all duration-1000 ease-out rounded-full`}
                  style={{
                    width: `${Math.min((card.value / Math.max(stats.projects, stats.barangays, stats.contractors, stats.officials, 1)) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Management Tools & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions - Professional Design */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-1 h-6 bg-blue-600 rounded"></span>
            <h3 className="text-lg font-semibold text-gray-900">Management Tools</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 p-5 rounded-lg transition-all duration-200 text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">New Project</p>
                  <p className="text-xs text-gray-600 mt-0.5">Create project</p>
                </div>
              </div>
            </button>
            
            <button className="group bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 border border-yellow-200 p-5 rounded-lg transition-all duration-200 text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500 rounded-lg group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Add Official</p>
                  <p className="text-xs text-gray-600 mt-0.5">Register official</p>
                </div>
              </div>
            </button>
            
            <button className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 p-5 rounded-lg transition-all duration-200 text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Barangays</p>
                  <p className="text-xs text-gray-600 mt-0.5">Manage areas</p>
                </div>
              </div>
            </button>
            
            <button className="group bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 border border-yellow-200 p-5 rounded-lg transition-all duration-200 text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500 rounded-lg group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Reports</p>
                  <p className="text-xs text-gray-600 mt-0.5">View analytics</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* System Activity Log */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-1 h-6 bg-blue-600 rounded"></span>
            <h3 className="text-lg font-semibold text-gray-900">System Activity</h3>
          </div>
          <div className="space-y-4">
            {[
              {
                action: "New project created",
                time: "2 hours ago",
                type: "project",
                icon: "🏗️",
              },
              {
                action: "Contractor registered",
                time: "5 hours ago",
                type: "contractor",
                icon: "⚙️",
              },
              {
                action: "Barangay updated",
                time: "1 day ago",
                type: "barangay",
                icon: "🏠",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 border border-gray-100"
              >
                <div className="text-xl mt-0.5">{activity.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

