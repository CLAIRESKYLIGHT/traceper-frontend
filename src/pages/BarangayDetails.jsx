import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

export default function BarangayDetails() {
  const { id } = useParams();
  const [barangay, setBarangay] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await API.get(`/barangays/${id}`);
        setBarangay(res.data);
      } catch (err) {
        console.error("Error fetching barangay details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="bg-white p-6 rounded-lg shadow-sm h-32"></div>
        </div>
      </div>
    );
  }

  if (!barangay) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-red-800 font-medium">Barangay not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border-l-4 border-blue-600 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-md">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{barangay.name}</h1>
            <p className="text-sm text-gray-600 mt-1">Barangay Information & Details</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-600 rounded"></span>
              Basic Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Population</p>
                <p className="text-2xl font-bold text-gray-900">
                  {barangay.population ? barangay.population.toLocaleString() : "N/A"}
                </p>
              </div>
              {barangay.status && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    barangay.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    {barangay.status}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Projects */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-600 rounded"></span>
              Projects ({barangay.projects?.length || 0})
            </h2>
            {barangay.projects?.length > 0 ? (
              <div className="space-y-3">
                {barangay.projects.map((p) => (
                  <div key={p.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                    <p className="font-semibold text-gray-900">{p.title}</p>
                    {p.status && (
                      <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                        p.status === "completed" ? "bg-green-100 text-green-800" :
                        p.status === "ongoing" ? "bg-yellow-100 text-yellow-800" :
                        "bg-blue-100 text-blue-800"
                      }`}>
                        {p.status}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No projects found for this barangay.</p>
            )}
          </div>
        </div>

        {/* Officials Sidebar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-600 rounded"></span>
            Officials ({barangay.officials?.length || 0})
          </h2>
          {barangay.officials?.length > 0 ? (
            <div className="space-y-4">
              {barangay.officials.map((o) => (
                <div key={o.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="font-semibold text-gray-900">{o.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{o.position}</p>
                  {o.contact && (
                    <p className="text-xs text-gray-500 mt-2">{o.contact}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No officials assigned.</p>
          )}
        </div>
      </div>
    </div>
  );
}
