import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../utils/useAuth";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import SearchBar from "../components/SearchBar";

const Projects = () => {
  const { isAdmin, userRole } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterBarangay, setFilterBarangay] = useState("");
  const [barangays, setBarangays] = useState([]);

  // Debug: Log admin status
  useEffect(() => {
    console.log("🔐 Admin Status:", { isAdmin, userRole });
  }, [isAdmin, userRole]);
  const [formData, setFormData] = useState({
    title: "",
    status: "",
    budget_allocated: "",
    barangay_id: "",
    contractor_id: "",
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await API.get("/projects");
      console.log("✅ Projects fetched:", response);
      
      // Handle different response structures
      const projectsData = response.data?.data || response.data || [];
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (err) {
      console.error("❌ Error fetching projects:", err);
      setError("Failed to load projects. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
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

  const openModal = (project = null) => {
    setEditingProject(project);
    setFormData(
      project || {
        title: "",
        status: "",
        budget_allocated: "",
        barangay_id: "",
        contractor_id: "",
      }
    );
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
    // Reset form when closing
    setFormData({
      title: "",
      status: "",
      budget_allocated: "",
      barangay_id: "",
      contractor_id: "",
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);
    
    // Validate required fields
    if (!formData.title || !formData.title.trim()) {
      setSubmitError("Project title is required.");
      setSubmitting(false);
      return;
    }

    // Helper function to convert empty strings to null
    const toNullIfEmpty = (value) => {
      if (value === "" || value === null || value === undefined) {
        return null;
      }
      return value;
    };

    // Prepare data - convert empty strings to null for optional fields
    const submitData = {
      title: formData.title.trim(),
      status: toNullIfEmpty(formData.status), // ✅ Fixed: converts "" to null
      budget_allocated: formData.budget_allocated 
        ? parseFloat(formData.budget_allocated) 
        : null,
      barangay_id: formData.barangay_id 
        ? parseInt(formData.barangay_id) 
        : null,
      contractor_id: formData.contractor_id 
        ? parseInt(formData.contractor_id) 
        : null,
    };

    // Validate numeric fields
    if (formData.budget_allocated && (isNaN(parseFloat(formData.budget_allocated)) || parseFloat(formData.budget_allocated) < 0)) {
      setSubmitError("Budget allocated must be a valid positive number.");
      setSubmitting(false);
      return;
    }
    if (formData.barangay_id && (isNaN(parseInt(formData.barangay_id)) || parseInt(formData.barangay_id) < 1)) {
      setSubmitError("Barangay ID must be a valid positive number.");
      setSubmitting(false);
      return;
    }
    if (formData.contractor_id && (isNaN(parseInt(formData.contractor_id)) || parseInt(formData.contractor_id) < 1)) {
      setSubmitError("Contractor ID must be a valid positive number.");
      setSubmitting(false);
      return;
    }

    // Validate status if provided
    const validStatuses = ['Not Started', 'In Progress', 'Completed', 'Delayed', 'Cancelled'];
    if (submitData.status && !validStatuses.includes(submitData.status)) {
      setSubmitError(`Status must be one of: ${validStatuses.join(', ')}`);
      setSubmitting(false);
      return;
    }

    try {
      console.log("📤 Submitting project:", submitData);
      
      if (editingProject) {
        const response = await API.put(`/projects/${editingProject.id}`, submitData);
        console.log("✅ Project updated:", response);
      } else {
        const response = await API.post("/projects", submitData);
        console.log("✅ Project created:", response);
      }
      
      // Reset form and close modal
      setFormData({
        title: "",
        status: "",
        budget_allocated: "",
        barangay_id: "",
        contractor_id: "",
      });
      await fetchProjects();
      closeModal();
      setToast({ message: editingProject ? "Project updated successfully!" : "Project created successfully!", type: "success" });
    } catch (err) {
      console.error("❌ Error saving project:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
        request: err.request,
      });
      
      // Handle different error types
      let errorMessage = "Failed to save project. ";
      
      if (!err.response) {
        // Network error or backend not reachable
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
        // Validation errors
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

  const handleDelete = (id) => {
    const project = projects.find(p => p.id === id);
    setConfirmModal({
      isOpen: true,
      title: "Delete Project",
      message: `Are you sure you want to delete "${project?.title || "this project"}"? This action cannot be undone.`,
      type: "danger",
      onConfirm: async () => {
        try {
          await API.delete(`/projects/${id}`);
          fetchProjects();
          setToast({ message: "Project deleted successfully!", type: "success" });
        } catch (err) {
          console.error("Error deleting project:", err);
          setToast({ message: err.response?.data?.message || "Failed to delete project.", type: "error" });
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter projects based on search and filters
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = !searchTerm || 
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.barangay?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.contractor?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || project.status === filterStatus;
    const matchesBarangay = !filterBarangay || project.barangay_id?.toString() === filterBarangay;
    
    return matchesSearch && matchesStatus && matchesBarangay;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Public Projects</h1>
              <p className="text-lg text-gray-600">Municipal infrastructure and development projects</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => openModal()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Project
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Total Projects: <strong className="text-gray-900">{projects.length}</strong></span>
            {searchTerm || filterStatus || filterBarangay ? (
              <span className="text-blue-600">• Showing {filteredProjects.length} result(s)</span>
            ) : null}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <SearchBar
                placeholder="Search projects by title, status, barangay, or contractor..."
                onSearch={setSearchTerm}
                value={searchTerm}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="">All Status</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Delayed">Delayed</option>
                <option value="Cancelled">Cancelled</option>
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
          </div>
          {(searchTerm || filterStatus || filterBarangay) && (
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
              {filterStatus && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Status: {filterStatus}
                  <button
                    onClick={() => setFilterStatus("")}
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
                  setFilterStatus("");
                  setFilterBarangay("");
                }}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {projects.length === 0 ? "No Projects Available" : "No Projects Match Your Search"}
            </h3>
            <p className="text-gray-600">
              {projects.length === 0 
                ? "There are currently no projects registered in the system."
                : "Try adjusting your search or filter criteria."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                {/* Project Header */}
                <div className="bg-blue-600 px-6 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-bold text-xl text-white line-clamp-2 flex-1">{project.title}</h3>
                    {isAdmin && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => openModal(project)}
                          className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          aria-label="Edit project"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          aria-label="Delete project"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Project Details */}
                <div className="p-6 space-y-6">
                  {/* Status Badge */}
                  <div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        project.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : project.status === "In Progress"
                          ? "bg-yellow-100 text-yellow-800"
                          : project.status === "Not Started"
                          ? "bg-blue-100 text-blue-800"
                          : project.status === "Delayed"
                          ? "bg-orange-100 text-orange-800"
                          : project.status === "Cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {project.status || "Unknown"}
                    </span>
                  </div>

                  {/* Project Information */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Barangay</p>
                      <p className="text-base font-semibold text-gray-900">
                        {project.barangay?.name || "Not specified"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Contractor</p>
                      <p className="text-base font-semibold text-gray-900">
                        {project.contractor?.name || "Not assigned"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Budget Allocated</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ₱{project.budget_allocated?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                      </p>
                    </div>

                    {/* Amount Spent & Remaining Budget */}
                    {project.budget_allocated && (
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Amount Spent</p>
                          <p className="text-lg font-bold text-orange-600">
                            ₱{(project.amount_spent || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Remaining</p>
                          <p className={`text-lg font-bold ${
                            (project.budget_allocated - (project.amount_spent || 0)) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ₱{((project.budget_allocated || 0) - (project.amount_spent || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Officials Involved */}
                    {project.officials && project.officials.length > 0 && (
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Officials Involved</p>
                        <div className="flex flex-wrap gap-2">
                          {project.officials.slice(0, 3).map((official) => (
                            <span key={official.id} className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                              {official.name}
                            </span>
                          ))}
                          {project.officials.length > 3 && (
                            <span className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                              +{project.officials.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Documents & Transactions Count */}
                    {(project.documents?.length > 0 || project.transactions?.length > 0) && (
                      <div className="flex items-center gap-6 pt-4 border-t border-gray-100 text-sm text-gray-600">
                        {project.documents?.length > 0 && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="font-medium">{project.documents.length} document{project.documents.length !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                        {project.transactions?.length > 0 && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span className="font-medium">{project.transactions.length} transaction{project.transactions.length !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit/Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {editingProject ? "Edit Project" : "Add New Project"}
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
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  required
                  disabled={submitting}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={submitting}
                  >
                    <option value="">Select Status</option>
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Allocated
                  </label>
                  <input
                    type="number"
                    name="budget_allocated"
                    value={formData.budget_allocated}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Barangay ID
                  </label>
                  <input
                    type="number"
                    name="barangay_id"
                    value={formData.barangay_id}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={submitting}
                    placeholder="Optional"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contractor ID
                  </label>
                  <input
                    type="number"
                    name="contractor_id"
                    value={formData.contractor_id}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={submitting}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-sm"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {editingProject ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    editingProject ? "Update Project" : "Create Project"
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
};

export default Projects;
