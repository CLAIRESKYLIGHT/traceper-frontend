import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../utils/useAuth";
import SearchBar from "../components/SearchBar";
import BarangayIRAChart from "../components/charts/BarangayIRAChart";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";

export default function Barangays() {
  const { isAdmin } = useAuth();
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingBarangay, setEditingBarangay] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "danger"
  });
  const [formData, setFormData] = useState({
    name: "",
    population: "",
    status: "active"
  });

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

  useEffect(() => {
    fetchBarangays();
  }, [selectedYear]);

  const openModal = (barangay = null) => {
    setEditingBarangay(barangay);
    setFormData(
      barangay || {
        name: "",
        population: "",
        status: "active"
      }
    );
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBarangay(null);
    setFormData({
      name: "",
      population: "",
      status: "active"
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    
    setSubmitting(true);
    try {
      const submitData = {
        name: formData.name.trim(),
        population: formData.population ? parseInt(formData.population) : null,
        status: formData.status || "active"
      };

      if (editingBarangay) {
        await API.put(`/barangays/${editingBarangay.id}`, submitData);
        setToast({ message: "Barangay updated successfully!", type: "success" });
      } else {
        await API.post("/barangays", submitData);
        setToast({ message: "Barangay created successfully!", type: "success" });
      }
      await fetchBarangays();
      closeModal();
    } catch (err) {
      console.error("Error saving barangay:", err);
      setToast({ message: err.response?.data?.message || "Failed to save barangay.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    const barangay = barangays.find(b => b.id === id);
    setConfirmModal({
      isOpen: true,
      title: "Delete Barangay",
      message: `Are you sure you want to delete "${barangay?.name}"? This action cannot be undone.`,
      type: "danger",
      onConfirm: async () => {
        try {
          await API.delete(`/barangays/${id}`);
          await fetchBarangays();
          setToast({ message: "Barangay deleted successfully!", type: "success" });
        } catch (err) {
          console.error("Error deleting barangay:", err);
          setToast({ message: err.response?.data?.message || "Failed to delete barangay.", type: "error" });
        }
      }
    });
  };

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
            {isAdmin && (
              <button
                onClick={() => openModal()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center gap-2 shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Barangay
              </button>
            )}
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

        {/* Barangay IRA Shares Chart */}
        {barangays.length > 0 && barangays.some(b => b.current_ira_share) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Barangay IRA Shares Comparison ({selectedYear})</h3>
            <BarangayIRAChart 
              barangays={barangays.map(b => ({
                barangay_name: b.name,
                ira_share: b.current_ira_share?.ira_share || 0
              }))} 
            />
          </div>
        )}

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
              <div
                key={b.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden relative group"
              >
                {isAdmin && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openModal(b);
                      }}
                      className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all border border-blue-200 hover:border-blue-600 bg-white shadow-sm"
                      title="Edit Barangay"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(b.id);
                      }}
                      className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all border border-red-200 hover:border-red-600 bg-white shadow-sm"
                      title="Delete Barangay"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
                <Link
                  to={`/barangays/${b.id}`}
                  className="block"
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
              </div>
            ))}
            </div>
          );
        })()}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingBarangay ? "Edit Barangay" : "Add New Barangay"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barangay Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter barangay name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Population
                </label>
                <input
                  type="number"
                  name="population"
                  value={formData.population}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter population"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : editingBarangay ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirm Modal */}
      {confirmModal.isOpen && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
          onConfirm={() => {
            if (confirmModal.onConfirm) confirmModal.onConfirm();
            setConfirmModal({ ...confirmModal, isOpen: false });
          }}
          onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        />
      )}
    </div>
  );
}
