import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../utils/useAuth";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import SearchBar from "../components/SearchBar";
import EmptyState from "../components/EmptyState";
import SkeletonLoader from "../components/SkeletonLoader";

export default function Officials() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
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

  // Separate Municipal Officials (no barangay_id) from Barangay Officials
  const municipalOfficials = officials.filter(o => !o.barangay_id);
  const barangayOfficials = officials.filter(o => o.barangay_id);

  // Filter officials
  const filterOfficials = (officialList) => {
    return officialList.filter((official) => {
      const matchesSearch = !searchTerm ||
        official.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        official.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        official.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        official.barangay?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPosition = !filterPosition || official.position === filterPosition;
      const matchesBarangay = !filterBarangay || official.barangay_id?.toString() === filterBarangay;

      return matchesSearch && matchesPosition && matchesBarangay;
    });
  };

  const filteredMunicipalOfficials = filterOfficials(municipalOfficials);
  const filteredBarangayOfficials = filterOfficials(barangayOfficials);

  // Get unique positions for filter
  const uniquePositions = [...new Set(officials.map(o => o.position).filter(Boolean))].sort();

  // OfficialCard Component
  const OfficialCard = ({ official, isAdmin, onEdit, onDelete, onViewDetails }) => {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-teal-100 hover:shadow-xl hover:border-teal-300 transition-all duration-300 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-5">
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
                  onClick={() => onEdit(official)}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Edit official"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(official.id)}
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
              <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Contact</p>
                <p className="text-sm text-gray-900 break-words">{official.contact}</p>
              </div>
            </div>
          )}
          {official.barangay && (
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
          )}

          {/* Details Button */}
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={onViewDetails}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg font-semibold hover:from-teal-700 hover:to-teal-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-100 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <SkeletonLoader type="card" count={6} />
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-100 page-transition">
      <div className="p-6 space-y-6">
        {/* Modern Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-teal-100 hover:shadow-xl hover:border-teal-300 transition-all duration-300 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl flex items-center justify-center shadow-lg">
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
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg font-semibold hover:from-teal-700 hover:to-teal-800 transition-colors shadow-sm"
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
        <div className="bg-white rounded-2xl shadow-lg border border-teal-100 hover:shadow-xl hover:border-teal-300 transition-all duration-300 p-6">
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

        {/* Municipal Officials Section */}
        {filteredMunicipalOfficials.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-1 w-12 bg-gradient-to-r from-teal-600 to-teal-700 rounded-full"></div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-700 to-teal-800 bg-clip-text text-transparent">
                Municipal Officials
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMunicipalOfficials.map((official) => (
                <OfficialCard 
                  key={official.id} 
                  official={official} 
                  isAdmin={isAdmin}
                  onEdit={openModal}
                  onDelete={handleDelete}
                  onViewDetails={() => navigate(`/officials/${official.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Barangay Officials Section */}
        {filteredBarangayOfficials.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-1 w-12 bg-gradient-to-r from-teal-600 to-teal-700 rounded-full"></div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-700 to-teal-800 bg-clip-text text-transparent">
                Barangay Officials
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBarangayOfficials.map((official) => (
                <OfficialCard 
                  key={official.id} 
                  official={official} 
                  isAdmin={isAdmin}
                  onEdit={openModal}
                  onDelete={handleDelete}
                  onViewDetails={() => navigate(`/officials/${official.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {filteredMunicipalOfficials.length === 0 && filteredBarangayOfficials.length === 0 && (
          <div className="card-modern">
            <EmptyState
              icon={
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
              title={officials.length === 0 ? "No Officials Found" : "No Officials Match Your Search"}
              description={officials.length === 0 
                ? "There are currently no officials registered in the system. Start by adding municipal or barangay officials to track government representatives."
                : "Try adjusting your search or filter criteria to find what you're looking for."}
              actionLabel={isAdmin && officials.length === 0 ? "Add First Official" : undefined}
              onAction={isAdmin && officials.length === 0 ? () => openModal() : undefined}
            />
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scaleIn">
              <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-6 rounded-t-2xl">
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
                    className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:from-teal-700 hover:to-teal-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
