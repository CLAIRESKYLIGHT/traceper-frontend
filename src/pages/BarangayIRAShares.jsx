import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../utils/useAuth";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";

export default function BarangayIRAShares() {
  const { isAdmin } = useAuth();
  const [iraShares, setIRAShares] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    barangay_id: "",
    year: "",
    ira_share: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [editingShare, setEditingShare] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "danger"
  });

  useEffect(() => {
    fetchBarangays();
    fetchIRAShares();
  }, [selectedYear]);

  const fetchBarangays = async () => {
    try {
      const response = await API.get("/barangays");
      const barangaysData = response.data?.data || response.data || [];
      setBarangays(Array.isArray(barangaysData) ? barangaysData : []);
    } catch (err) {
      console.error("Error fetching barangays:", err);
    }
  };

  const fetchIRAShares = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/barangay-ira-shares?year=${selectedYear}`);
      const sharesData = response.data?.data || response.data || [];
      setIRAShares(Array.isArray(sharesData) ? sharesData : []);
    } catch (err) {
      console.error("Error fetching IRA shares:", err);
      setError("Failed to load IRA shares.");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (share = null) => {
    if (share) {
      setEditingShare(share);
      setFormData({
        barangay_id: share.barangay_id?.toString() || "",
        year: share.year?.toString() || selectedYear.toString(),
        ira_share: share.ira_share?.toString() || "",
        notes: share.notes || "",
      });
    } else {
      setEditingShare(null);
      setFormData({
        barangay_id: "",
        year: selectedYear.toString(),
        ira_share: "",
        notes: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingShare(null);
    setFormData({
      barangay_id: "",
      year: selectedYear.toString(),
      ira_share: "",
      notes: "",
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const submitData = {
      barangay_id: parseInt(formData.barangay_id),
      year: parseInt(formData.year),
      ira_share: parseFloat(formData.ira_share) || 0,
      notes: formData.notes.trim() || null,
    };

    try {
      if (editingShare) {
        await API.put(`/barangay-ira-shares/${editingShare.id}`, submitData);
      } else {
        await API.post("/barangay-ira-shares", submitData);
      }
      await fetchIRAShares();
      closeModal();
      setToast({ message: editingShare ? "IRA share updated successfully!" : "IRA share saved successfully!", type: "success" });
    } catch (err) {
      console.error("Error saving IRA share:", err);
      setToast({ message: err.response?.data?.message || "Failed to save IRA share.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    const share = iraShares.find(s => s.id === id);
    setConfirmModal({
      isOpen: true,
      title: "Delete IRA Share",
      message: `Are you sure you want to delete this IRA share${share?.barangay?.name ? ` for ${share.barangay.name}` : ""}? This action cannot be undone.`,
      type: "danger",
      onConfirm: async () => {
        try {
          await API.delete(`/barangay-ira-shares/${id}`);
          await fetchIRAShares();
          setToast({ message: "IRA share deleted successfully!", type: "success" });
        } catch (err) {
          console.error("Error deleting IRA share:", err);
          setToast({ message: err.response?.data?.message || "Failed to delete IRA share.", type: "error" });
        }
      }
    });
  };

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

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  // Group by barangay for better display
  const groupedShares = iraShares.reduce((acc, share) => {
    const key = share.barangay_id;
    if (!acc[key]) {
      acc[key] = {
        barangay: share.barangay || { name: "Unknown" },
        shares: [],
      };
    }
    acc[key].shares.push(share);
    return acc;
  }, {});

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border-l-4 border-blue-600 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Barangay IRA Shares</h1>
            <p className="text-sm text-gray-600 mt-1">Internal Revenue Allotment distribution by barangay</p>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">Year:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {[2021, 2020, 2019, 2018, 2017, 2016, 2015, 2010].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            {isAdmin && (
              <button
                onClick={() => openModal()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add IRA Share
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {iraShares.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Barangays</p>
            <p className="text-3xl font-bold text-gray-900">{Object.keys(groupedShares).length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total IRA Shares</p>
            <p className="text-3xl font-bold text-blue-600">
              ₱{iraShares.reduce((sum, share) => sum + (parseFloat(share.ira_share) || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Average IRA Share</p>
            <p className="text-3xl font-bold text-green-600">
              ₱{(iraShares.reduce((sum, share) => sum + (parseFloat(share.ira_share) || 0), 0) / Math.max(iraShares.length, 1)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

      {/* IRA Shares List */}
      {iraShares.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No IRA shares found for {selectedYear}.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">IRA Shares for {selectedYear}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barangay</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IRA Share</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {iraShares
                  .sort((a, b) => (parseFloat(b.ira_share) || 0) - (parseFloat(a.ira_share) || 0))
                  .map((share) => (
                    <tr key={share.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {share.barangay?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{share.year}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                        ₱{(share.ira_share || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {share.notes || "-"}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => openModal(share)}
                            className="text-yellow-600 hover:text-yellow-800 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(share.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-scaleIn">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {editingShare ? "Edit IRA Share" : "Add IRA Share"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-blue-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Barangay *</label>
                <select
                  name="barangay_id"
                  value={formData.barangay_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={submitting}
                >
                  <option value="">Select Barangay</option>
                  {barangays.map((barangay) => (
                    <option key={barangay.id} value={barangay.id}>
                      {barangay.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IRA Share (₱) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="ira_share"
                  value={formData.ira_share}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={submitting}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : editingShare ? "Update" : "Create"}
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

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null, type: "danger" })}
        onConfirm={confirmModal.onConfirm || (() => {})}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </div>
  );
}

