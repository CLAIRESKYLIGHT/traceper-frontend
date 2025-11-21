import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../utils/useAuth";

export default function Officials() {
  const { isAdmin } = useAuth();
  const [officials, setOfficials] = useState([]);
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
  }, []);

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
    try {
      if (editingOfficial) {
        await API.put(`/officials/${editingOfficial.id}`, formData);
      } else {
        await API.post("/officials", formData);
      }
      fetchOfficials();
      closeModal();
    } catch (err) {
      console.error("Error saving official:", err);
      alert("Failed to save official.");
    }
  };

  // ✅ Delete official
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this official?")) {
      try {
        await API.delete(`/officials/${id}`);
        fetchOfficials();
      } catch (err) {
        console.error("Error deleting official:", err);
        alert("Failed to delete official.");
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-48 rounded-lg"></div>
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
    <div className="p-6 min-h-screen animate-fadeIn">
      {/* Modern Header */}
      <div className="card-modern bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 shadow-xl mb-6 animate-slideDown">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-yellow-400/30 animate-float">
              <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Barangay Officials</h1>
              <p className="text-blue-100 mt-1">Government officials and representatives</p>
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={() => openModal()}
              className="btn-secondary-modern flex items-center gap-2 group"
            >
              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Official
            </button>
          )}
        </div>
        <div className="mt-6 flex items-center gap-4">
          <div className="glass-effect bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
              <span className="text-white font-semibold">Total Officials: {officials.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Officials Grid */}
      {officials.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Officials Found</h3>
          <p className="text-gray-600">There are currently no officials registered in the system.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {officials.map((official, index) => (
            <div
              key={official.id}
              className="card-modern overflow-hidden animate-scaleIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 text-white relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <h3 className="font-bold text-xl relative z-10">{official.name}</h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Position</p>
                  <p className="text-sm font-semibold text-gray-900">{official.position}</p>
                </div>
                {official.contact && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Contact</p>
                    <p className="text-sm text-gray-700">{official.contact}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Barangay</p>
                  <p className="text-sm text-gray-700">{official.barangay?.name || "N/A"}</p>
                </div>

                {/* Projects Involved (Many-to-Many) */}
                {official.projects && official.projects.length > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">Projects Involved</p>
                    <div className="space-y-1">
                      {official.projects.slice(0, 3).map((project) => (
                        <div key={project.id} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                          {project.title}
                        </div>
                      ))}
                      {official.projects.length > 3 && (
                        <p className="text-xs text-gray-500">+{official.projects.length - 3} more projects</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Transactions Authorized */}
                {official.transactions && official.transactions.length > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Transactions Authorized</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {official.transactions.length} transaction{official.transactions.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Total: ₱{official.transactions.reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                )}

                {isAdmin && (
                  <div className="pt-4 border-t border-gray-100 flex items-center gap-2">
                    <button
                      onClick={() => openModal(official)}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(official.id)}
                      className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingOfficial ? "Edit Official" : "Add New Official"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Information
                </label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barangay ID
                </label>
                <input
                  type="number"
                  name="barangay_id"
                  value={formData.barangay_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingOfficial ? "Update Official" : "Add Official"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
