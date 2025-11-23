import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../utils/useAuth";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";

export default function Contractors() {
  const { isAdmin } = useAuth();
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingContractor, setEditingContractor] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    owner_name: "",
    business_registration: "",
    contact_info: "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "danger"
  });

  // ✅ Fetch all contractors
  const fetchContractors = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("📡 Fetching contractors...");
      
      const response = await API.get("/contractors");
      console.log("📦 Raw response:", response);
      console.log("📦 Response data:", response.data);
      
      // Handle different response structures
      let contractorsData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          contractorsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          contractorsData = response.data.data;
        } else if (response.data.contractors && Array.isArray(response.data.contractors)) {
          contractorsData = response.data.contractors;
        }
      }
      
      console.log("📊 Contractors data extracted:", contractorsData);
      
      // Backend now calculates total_received, but ensure it's a number
      const processedContractors = Array.isArray(contractorsData) 
        ? contractorsData.map(contractor => ({
            ...contractor,
            total_received: parseFloat(contractor.total_received) || 0
          }))
        : [];
      
      console.log("✅ Processed contractors:", processedContractors);
      setContractors(processedContractors);
      
      if (processedContractors.length === 0) {
        console.warn("⚠️ No contractors found in response");
      }
    } catch (err) {
      console.error("❌ Error fetching contractors:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      let errorMessage = "Failed to load contractors.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 401) {
        errorMessage = "You are not authorized. Please log in again.";
      } else if (err.response?.status === 403) {
        errorMessage = "You don't have permission to view contractors.";
      } else if (!err.response) {
        errorMessage = "Cannot connect to the server. Please check if the backend is running.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractors();
  }, []);

  // ✅ Handle input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Open modal
  const openModal = (contractor = null) => {
    setEditingContractor(contractor);
    setFormData(
      contractor || {
        name: "",
        owner_name: "",
        business_registration: "",
        contact_info: "",
        address: "",
      }
    );
    setSubmitError("");
    setShowModal(true);
  };

  // ✅ Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingContractor(null);
    setFormData({
      name: "",
      owner_name: "",
      business_registration: "",
      contact_info: "",
      address: "",
    });
    setSubmitError("");
  };

  // ✅ Add or update contractor
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);

    // Validate required fields
    if (!formData.name || !formData.name.trim()) {
      setSubmitError("Contractor name is required.");
      setSubmitting(false);
      return;
    }

    // Prepare data - convert empty strings to null for optional fields
    const submitData = {
      name: formData.name.trim(),
      owner_name: formData.owner_name?.trim() || null,
      business_registration: formData.business_registration?.trim() || null,
      contact_info: formData.contact_info?.trim() || null,
      address: formData.address?.trim() || null,
    };

    try {
      console.log("📤 Submitting contractor:", submitData);
      
      if (editingContractor) {
        const response = await API.put(`/contractors/${editingContractor.id}`, submitData);
        console.log("✅ Contractor updated:", response);
      } else {
        const response = await API.post("/contractors", submitData);
        console.log("✅ Contractor created:", response);
      }
      
      await fetchContractors();
      closeModal();
      setToast({ message: editingContractor ? "Contractor updated successfully!" : "Contractor created successfully!", type: "success" });
    } catch (err) {
      console.error("❌ Error saving contractor:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
        request: err.request,
      });
      
      // Handle different error types
      let errorMessage = "Failed to save contractor. ";
      
      if (!err.response) {
        if (err.request) {
          errorMessage += "Cannot connect to the server. Please check if the backend is running.";
        } else {
          errorMessage += "Network error occurred.";
        }
      } else if (err.response.status === 401) {
        errorMessage = "You are not authorized. Please log in again.";
      } else if (err.response.status === 403) {
        errorMessage = "You don't have permission to perform this action.";
      } else if (err.response.status === 422) {
        const errors = err.response.data?.errors;
        if (errors) {
          const errorList = Object.entries(errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`)
            .join("\n");
          errorMessage = `Validation errors:\n${errorList}`;
        } else {
          errorMessage = err.response.data?.message || "Validation failed. Please check your input.";
        }
      } else if (err.response.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response.data?.error) {
        errorMessage = err.response.data.error;
      } else {
        errorMessage += `Server returned error (${err.response.status}). Please check the console for details.`;
      }
      
      setSubmitError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Delete contractor
  const handleDelete = (id) => {
    const contractor = contractors.find(c => c.id === id);
    setConfirmModal({
      isOpen: true,
      title: "Delete Contractor",
      message: `Are you sure you want to delete "${contractor?.name || "this contractor"}"? This action cannot be undone.`,
      type: "danger",
      onConfirm: async () => {
        try {
          await API.delete(`/contractors/${id}`);
          await fetchContractors();
          setToast({ message: "Contractor deleted successfully!", type: "success" });
        } catch (err) {
          console.error("Error deleting contractor:", err);
          setToast({ message: err.response?.data?.message || "Failed to delete contractor.", type: "error" });
        }
      }
    });
  };

  if (loading)
    return (
      <p className="p-6 text-center text-gray-600">Loading contractors...</p>
    );
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;

  return (
    <div className="p-6 min-h-screen animate-fadeIn">
      {/* Modern Header */}
      <div className="card-modern bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 shadow-xl mb-6 animate-slideDown">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-yellow-400/30 animate-float">
              <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Contractors</h1>
              <p className="text-blue-100 mt-1">Registered business partners and contractors</p>
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
              Add Contractor
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card-modern overflow-x-auto animate-slideUp">
        <table className="min-w-full border border-gray-200 rounded-xl overflow-hidden">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <tr>
              <th className="px-4 py-3 text-left border text-white font-semibold">Name</th>
              <th className="px-4 py-3 text-left border text-white font-semibold">Owner Name</th>
              <th className="px-4 py-3 text-left border text-white font-semibold">Contact Info</th>
              <th className="px-4 py-3 text-left border text-white font-semibold">Address</th>
              <th className="px-4 py-3 text-left border text-white font-semibold">Total Received</th>
              {isAdmin && (
                <th className="px-4 py-3 text-center border text-white font-semibold">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {contractors.length === 0 ? (
              <tr>
                <td
                  colSpan={isAdmin ? "6" : "5"}
                  className="text-center text-gray-500 py-4 border-t"
                >
                  No contractors found.
                </td>
              </tr>
            ) : (
              contractors.map((contractor) => (
                <tr key={contractor.id} className="border-t hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-3 border font-semibold text-gray-900">{contractor.name}</td>
                  <td className="px-4 py-3 border">
                    {contractor.owner_name || "—"}
                  </td>
                  <td className="px-4 py-3 border">
                    {contractor.contact_info || "—"}
                  </td>
                  <td className="px-4 py-3 border">{contractor.address || "—"}</td>
                  <td className="px-4 py-2 border">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-green-600">
                        ₱{(contractor.total_received || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {contractor.projects?.length || 0} project{(contractor.projects?.length || 0) !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 border text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal(contractor)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Contractor"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(contractor.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Contractor"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {editingContractor ? "Edit Contractor" : "Add New Contractor"}
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
              {submitError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">Error</p>
                      <p className="text-sm text-red-700 mt-1 whitespace-pre-line">{submitError}</p>
                    </div>
                    <button
                      onClick={() => setSubmitError("")}
                      className="text-red-500 hover:text-red-700"
                      type="button"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contractor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter contractor name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    name="owner_name"
                    placeholder="Owner name (optional)"
                    value={formData.owner_name || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Registration
                  </label>
                  <input
                    type="text"
                    name="business_registration"
                    placeholder="Registration number (optional)"
                    value={formData.business_registration || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Information
                </label>
                <input
                  type="text"
                  name="contact_info"
                  placeholder="Phone, email, or other contact info (optional)"
                  value={formData.contact_info || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder="Business address (optional)"
                  value={formData.address || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={submitting}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-modern flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {editingContractor ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    editingContractor ? "Update Contractor" : "Create Contractor"
                  )}
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
