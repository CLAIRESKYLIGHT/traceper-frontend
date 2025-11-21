import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import SearchBar from "../components/SearchBar";

export default function Barangays() {
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchBarangays = async () => {
      try {
        setLoading(true);
        console.log("📡 Fetching barangays...");
        const response = await API.get(`/barangays?year=${selectedYear}`, {
          headers: { "Cache-Control": "no-cache" },
        });
        console.log("✅ Barangays fetched:", response.data);
        const barangaysData = response.data?.data || response.data || [];
        setBarangays(Array.isArray(barangaysData) ? barangaysData : []);
      } catch (err) {
        console.error("❌ Error fetching barangays:", err);
        setError("Failed to load barangays.");
      } finally {
        setLoading(false);
      }
    };

    fetchBarangays();
  }, [selectedYear]);

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Barangays</h1>
              <p className="text-lg text-gray-600">Municipal administrative areas and communities</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Total: <strong className="text-gray-900">{barangays.length}</strong></span>
                {searchTerm && (
                  <span className="text-blue-600">• Showing {barangays.filter(b => !searchTerm || b.name?.toLowerCase().includes(searchTerm.toLowerCase())).length} result(s)</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-gray-700">Year:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium"
                >
                  {[2021, 2020, 2019, 2018, 2017, 2016, 2015, 2010].map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <SearchBar
            placeholder="Search barangays by name..."
            onSearch={setSearchTerm}
            value={searchTerm}
          />
          {searchTerm && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-gray-600">Active filter:</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm("")}
                  className="hover:text-blue-900"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Filter and Display Barangays */}
        {(() => {
          const filteredBarangays = barangays.filter((b) => {
            return !searchTerm || 
              b.name?.toLowerCase().includes(searchTerm.toLowerCase());
          });

          return filteredBarangays.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {barangays.length === 0 ? "No Barangays Available" : "No Barangays Match Your Search"}
            </h3>
            <p className="text-gray-600">
              {barangays.length === 0 
                ? "There are currently no barangays registered in the system."
                : "Try adjusting your search criteria."}
            </p>
          </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBarangays.map((b) => (
              <Link
                key={b.id}
                to={`/barangays/${b.id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                <div className="bg-blue-600 px-6 py-5">
                  <h2 className="text-xl font-bold text-white">{b.name}</h2>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Population</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {b.population ? b.population.toLocaleString() : "N/A"}
                    </p>
                  </div>
                  
                  {/* IRA Share Display */}
                  {b.current_ira_share && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        IRA Share ({b.ira_share_year || b.current_ira_share.year})
                      </p>
                      <p className="text-xl font-bold text-blue-600">
                        ₱{(b.current_ira_share.ira_share || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                  
                  {b.status && (
                    <div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        b.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {b.status}
                      </span>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-gray-100 flex items-center gap-2 text-sm text-blue-600 font-medium">
                      <span>View Details</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
