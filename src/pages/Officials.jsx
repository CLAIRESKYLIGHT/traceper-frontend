import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../utils/useAuth";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import SearchBar from "../components/SearchBar";

export default function Officials() {
  const { isAdmin } = useAuth();
  const [officials, setOfficials] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingOfficial, setEditingOfficial] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    contact: "",
    barangay_id: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPosition, setFilterPosition] = useState("");
  const [filterBarangay, setFilterBarangay] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "danger"
  });

  // ✅ Fetch all officials
  const fetchOfficials = async () => {
    try {
      setLoading(true);
      const response = await API.get("/officials");
      const officialsData = response.data?.data || response.data || [];
      setOfficials(Array.isArray(officialsData) ? officialsData : []);
    } catch (err) {
      console.error("Error fetching officials:", err);
      setError("Failed to load officials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficials();
    fetchBarangays();
  }, []);

  const fetchBarangays = async () => {
    try {
      const response = await API.get("/barangays");
      const barangaysData = response.data?.data || response.data || [];
      setBarangays(Array.isArray(barangaysData) ? barangaysData : []);
    } catch (err) {
      console.error("Error fetching barangays:", err);
    }
  };

  // ✅ Handle form input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Open Add/Edit Modal
  const openModal = (official = null) => {
    setEditingOfficial(official);
    setFormData(
      official || { name: "", position: "", contact: "", barangay_id: "" }
    );
    setShowModal(true);
  };

  // ✅ Close Modal
  const closeModal = () => {
    setShowModal(false);
    setEditingOfficial(null);
  };

  // ✅ Save official (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    
    setSubmitting(true);
    try {
      const submitData = {
        name: formData.name.trim(),
        position: formData.position.trim(),
        contact: formData.contact.trim() || null,
        barangay_id: formData.barangay_id ? parseInt(formData.barangay_id) : null,
      };

      if (editingOfficial) {
        await API.put(`/officials/${editingOfficial.id}`, submitData);
        setToast({ message: "Official updated successfully!", type: "success" });
      } else {
        await API.post("/officials", submitData);
        setToast({ message: "Official created successfully!", type: "success" });
      }
      await fetchOfficials();
      closeModal();
    } catch (err) {
      console.error("Error saving official:", err);
      setToast({ message: err.response?.data?.message || "Failed to save official.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Delete official
  const handleDelete = (id) => {
    const official = officials.find(o => o.id === id);
    setConfirmModal({
      isOpen: true,
      title: "Delete Official",
      message: `Are you sure you want to delete "${official?.name || "this official"}"? This action cannot be undone.`,
      type: "danger",
      onConfirm: async () => {
        try {
          await API.delete(`/officials/${id}`);
          fetchOfficials();
          setToast({ message: "Official deleted successfully!", type: "success" });
        } catch (err) {
          console.error("Error deleting official:", err);
          setToast({ message: err.response?.data?.message || "Failed to delete official.", type: "error" });
        }
      }
    });
  };

  // Filter officials
  const filteredOfficials = officials.filter((official) => {
    const matchesSearch = !searchTerm ||
      official.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      official.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      official.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      official.barangay?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPosition = !filterPosition || official.position === filterPosition;
    const matchesBarangay = !filterBarangay || official.barangay_id?.toString() === filterBarangay;

    return matchesSearch && matchesPosition && matchesBarangay;
  });

  // Get unique positions for filter
  const uniquePositions = [...new Set(officials.map(o => o.position).filter(Boolean))].sort();

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-16 bg-gray-200 rounded-xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-64 rounded-xl"></div>
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
      <div className="p-6 space-y-6">
        {/* Modern Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Barangay Officials</h1>
                <p className="text-gray-600 mt-1">Government officials and representatives</p>
              </div>
            </div>
            {isAdmin && (
              <button
                onClick={() => openModal()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Official
              </button>
            )}
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <p className="text-sm font-medium text-blue-600 mb-1">Total Officials</p>
              <p className="text-2xl font-bold text-blue-900">{officials.length}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <p className="text-sm font-medium text-green-600 mb-1">Unique Positions</p>
              <p className="text-2xl font-bold text-green-900">{uniquePositions.length}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <p className="text-sm font-medium text-purple-600 mb-1">Barangays Covered</p>
              <p className="text-2xl font-bold text-purple-900">
                {[...new Set(officials.filter(o => o.barangay_id).map(o => o.barangay_id))].length}
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <SearchBar
                placeholder="Search officials by name, position, contact, or barangay..."
                onSearch={setSearchTerm}
                value={searchTerm}
              />
            </div>
            <select
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="">All Positions</option>
              {uniquePositions.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
            <select
              value={filterBarangay}
              onChange={(e) => setFilterBarangay(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="">All Barangays</option>
              {barangays.map((barangay) => (
                <option key={barangay.id} value={barangay.id}>
                  {barangay.name}
                </option>
              ))}
            </select>
          </div>

          {/* Active Filters */}
          {(searchTerm || filterPosition || filterBarangay) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchTerm && (
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
              )}
              {filterPosition && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Position: {filterPosition}
                  <button
                    onClick={() => setFilterPosition("")}
                    className="hover:text-green-900"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {filterBarangay && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  Barangay: {barangays.find(b => b.id.toString() === filterBarangay)?.name}
                  <button
                    onClick={() => setFilterBarangay("")}
                    className="hover:text-purple-900"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterPosition("");
                  setFilterBarangay("");
                }}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Officials Grid */}
        {filteredOfficials.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {officials.length === 0 ? "No Officials Found" : "No Officials Match Your Search"}
            </h3>
            <p className="text-gray-600">
              {officials.length === 0 
                ? "There are currently no officials registered in the system."
                : "Try adjusting your search or filter criteria."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOfficials.map((official, index) => (
              <div
                key={official.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-white line-clamp-2">{official.name}</h3>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="px-2 py-1 bg-white/20 text-white rounded text-xs font-semibold">
                          {official.position}
                        </span>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => openModal(official)}
                          className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          aria-label="Edit official"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(official.id)}
                          className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          aria-label="Delete official"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {official.contact && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Contact</p>
                        <p className="text-sm text-gray-900 break-words">{official.contact}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Barangay</p>
                      <p className="text-sm font-semibold text-gray-900">{official.barangay?.name || "N/A"}</p>
                    </div>
                  </div>

                  {/* Projects Involved (Many-to-Many) */}
                  {official.projects && official.projects.length > 0 && (
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Projects Involved</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {official.projects.slice(0, 3).map((project) => (
                          <span key={project.id} className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                            {project.title}
                          </span>
                        ))}
                        {official.projects.length > 3 && (
                          <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                            +{official.projects.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Transactions Authorized */}
                  {official.transactions && official.transactions.length > 0 && (
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Transactions Authorized</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {official.transactions.length} transaction{official.transactions.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium text-gray-500 mb-1">Total Amount</p>
                          <p className="text-sm font-bold text-green-600">
                            ₱{official.transactions.reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
          ))}
        </div>
      )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scaleIn">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">
                    {editingOfficial ? "Edit Official" : "Add New Official"}
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
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter full name"
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Position *
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="e.g., Barangay Captain, Councilor"
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Information
                  </label>
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Phone number or email"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Barangay
                  </label>
                  <select
                    name="barangay_id"
                    value={formData.barangay_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    disabled={submitting}
                  >
                    <option value="">Select Barangay (Optional)</option>
                    {barangays.map((barangay) => (
                      <option key={barangay.id} value={barangay.id}>
                        {barangay.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    {submitting ? "Saving..." : editingOfficial ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

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
