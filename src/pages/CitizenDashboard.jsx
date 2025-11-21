import { useEffect, useState } from "react";
import API from "../services/api";

export default function CitizenDashboard() {
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
      <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
        <div className="animate-pulse">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8">
            <div className="h-8 bg-blue-500/50 rounded w-64 mb-4"></div>
            <div className="h-4 bg-blue-500/50 rounded w-96"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-40"></div>
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
            <div className="flex items-center gap-4 mb-3">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-yellow-400/30 animate-float">
                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Public Transparency Portal</h1>
                <p className="text-blue-100 mt-1">Access municipal information and track public projects</p>
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="glass-effect bg-white/10 backdrop-blur-md rounded-xl px-5 py-4 border border-white/20">
              <p className="text-xs text-blue-100 uppercase tracking-wider font-semibold">Last Updated</p>
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

      {/* Transparency Notice */}
      <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-blue-900 font-bold text-lg mb-1">Transparency & Accountability</h3>
            <p className="text-blue-800 text-sm leading-relaxed">
              This portal provides public access to municipal information, project data, and official documents. 
              All information displayed is publicly available and updated regularly to ensure transparency in government operations.
            </p>
          </div>
        </div>
      </div>

      {/* Public Statistics Overview */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-blue-600 rounded"></span>
          Municipal Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((card, index) => (
            <div
              key={card.title}
              className="card-modern group relative overflow-hidden animate-scaleIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${card.gradient.includes('blue') ? 'bg-blue-50' : 'bg-yellow-50'}`}>
                    <span className="text-2xl">{card.icon}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-500 font-medium">Public</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {card.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600 mt-2">{card.description}</p>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="h-1 bg-gray-100">
                <div
                  className={`h-full ${card.gradient.includes('blue') ? 'bg-blue-600' : 'bg-yellow-500'} transition-all duration-1000`}
                  style={{
                    width: `${Math.min((card.value / Math.max(stats.projects, stats.barangays, stats.contractors, stats.officials, 1)) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Information Access Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Access Links */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-1 h-6 bg-blue-600 rounded"></span>
            <h3 className="text-lg font-semibold text-gray-900">Quick Access</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <a href="/projects" className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 p-5 rounded-lg transition-all duration-200 text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Projects</p>
                  <p className="text-xs text-gray-600 mt-0.5">View all projects</p>
                </div>
              </div>
            </a>
            
            <a href="/barangays" className="group bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 border border-yellow-200 p-5 rounded-lg transition-all duration-200 text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500 rounded-lg group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Barangays</p>
                  <p className="text-xs text-gray-600 mt-0.5">Explore areas</p>
                </div>
              </div>
            </a>
            
            <a href="/officials" className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 p-5 rounded-lg transition-all duration-200 text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Officials</p>
                  <p className="text-xs text-gray-600 mt-0.5">Contact info</p>
                </div>
              </div>
            </a>
            
            <a href="/documents" className="group bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 border border-yellow-200 p-5 rounded-lg transition-all duration-200 text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500 rounded-lg group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Documents</p>
                  <p className="text-xs text-gray-600 mt-0.5">Public files</p>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Public Updates */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-1 h-6 bg-blue-600 rounded"></span>
            <h3 className="text-lg font-semibold text-gray-900">Recent Updates</h3>
          </div>
          <div className="space-y-4">
            {[
              {
                action: "New project announced",
                time: "2 hours ago",
                type: "project",
                icon: "🏗️",
              },
              {
                action: "Barangay information updated",
                time: "5 hours ago",
                type: "barangay",
                icon: "🏠",
              },
              {
                action: "New document published",
                time: "1 day ago",
                type: "document",
                icon: "📄",
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

