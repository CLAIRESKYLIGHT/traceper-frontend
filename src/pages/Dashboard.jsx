import { useEffect, useState } from "react";
import api from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    projects: 0,
    barangays: 0,
    contractors: 0,
    officials: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/dashboard/stats");
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">📊 Dashboard Overview</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 shadow-md rounded-2xl border-l-4 border-blue-600">
          <h3 className="font-semibold text-gray-600">Projects</h3>
          <p className="text-3xl font-bold text-blue-700">{stats.projects}</p>
        </div>

        <div className="bg-white p-6 shadow-md rounded-2xl border-l-4 border-green-600">
          <h3 className="font-semibold text-gray-600">Barangays</h3>
          <p className="text-3xl font-bold text-green-700">{stats.barangays}</p>
        </div>

        <div className="bg-white p-6 shadow-md rounded-2xl border-l-4 border-purple-600">
          <h3 className="font-semibold text-gray-600">Contractors</h3>
          <p className="text-3xl font-bold text-purple-700">
            {stats.contractors}
          </p>
        </div>

        <div className="bg-white p-6 shadow-md rounded-2xl border-l-4 border-yellow-600">
          <h3 className="font-semibold text-gray-600">Officials</h3>
          <p className="text-3xl font-bold text-yellow-700">
            {stats.officials}
          </p>
        </div>
      </div>
    </div>
  );
}
