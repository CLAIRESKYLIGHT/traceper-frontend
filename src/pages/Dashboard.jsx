import { useEffect, useState } from "react";
import api from "../services/api";

export default function Dashboard() {
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
        const { data } = await api.get("/dashboard/stats");
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
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
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-gray-200 p-6 rounded-2xl h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Dashboard Overview
          </h2>
          <p className="text-gray-600">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
            <p className="text-sm text-yellow-800">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={card.title}
            className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-xl bg-gradient-to-r ${card.gradient} shadow-md`}
              >
                <span className="text-2xl">{card.icon}</span>
              </div>
              <div className="text-right">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-gray-600 text-sm font-medium">{card.title}</p>
              <p className="text-3xl font-bold text-gray-800">
                {card.value.toLocaleString()}
              </p>
              <p className="text-gray-500 text-xs">{card.description}</p>
            </div>

            {/* Progress indicator */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${card.gradient} transition-all duration-1000 ease-out`}
                  style={{
                    width: `${Math.min((card.value / 100) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-xl transition-colors duration-200 border border-blue-100">
              <span className="text-lg">📋</span>
              <p className="font-medium mt-2">New Project</p>
            </button>
            <button className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 p-4 rounded-xl transition-colors duration-200 border border-yellow-100">
              <span className="text-lg">👥</span>
              <p className="font-medium mt-2">Add Official</p>
            </button>
            <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-xl transition-colors duration-200 border border-blue-100">
              <span className="text-lg">🏠</span>
              <p className="font-medium mt-2">Manage Barangays</p>
            </button>
            <button className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 p-4 rounded-xl transition-colors duration-200 border border-yellow-100">
              <span className="text-lg">📊</span>
              <p className="font-medium mt-2">View Reports</p>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {[
              {
                action: "New project created",
                time: "2 hours ago",
                type: "project",
              },
              {
                action: "Contractor registered",
                time: "5 hours ago",
                type: "contractor",
              },
              {
                action: "Barangay updated",
                time: "1 day ago",
                type: "barangay",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    activity.type === "project"
                      ? "bg-blue-500"
                      : activity.type === "contractor"
                      ? "bg-yellow-500"
                      : "bg-blue-400"
                  }`}
                ></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
