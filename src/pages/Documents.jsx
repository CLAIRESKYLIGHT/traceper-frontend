import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../utils/useAuth";

export default function Documents() {
  const { isAdmin, userRole } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [documentType, setDocumentType] = useState("project"); // "project" or "transaction"
  const [uploading, setUploading] = useState(false);

  // Debug: Log admin status
  useEffect(() => {
    console.log("🔐 Admin Status:", { isAdmin, userRole });
  }, [isAdmin, userRole]);

  // ✅ Fetch all documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("📡 Fetching documents from API...");
      const response = await API.get("/documents");
      console.log("✅ Documents API response:", response);
      
      // Handle different response structures
      const documentsData = response.data?.data || response.data || [];
      console.log("📄 Documents data:", documentsData);
      
      setDocuments(Array.isArray(documentsData) ? documentsData : []);
    } catch (err) {
      console.error("❌ Error fetching documents:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
      });
      
      // More detailed error message
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error 
        || err.message 
        || "Failed to load documents.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch projects for dropdown
  const fetchProjects = async () => {
    try {
      const response = await API.get("/projects");
      const projectsData = response.data?.data || response.data || [];
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };


  // ✅ Fetch transactions for dropdown
  const [transactions, setTransactions] = useState([]);
  const fetchTransactions = async () => {
    try {
      const response = await API.get("/transactions");
      const transactionsData = response.data?.data || response.data || [];
      setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  useEffect(() => {
    // Fetch in parallel for better performance
    Promise.all([
      fetchDocuments(),
      fetchProjects(),
      fetchTransactions()
    ]).catch(err => {
      console.error("Error fetching initial data:", err);
    });
  }, []);

  // ✅ Handle upload
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file || !title) {
      alert("Please provide a title and select a file.");
      return;
    }

    // Validate: either project_id or transaction_id must be provided
    if (documentType === "project" && !projectId) {
      alert("Please select a project.");
      return;
    }

    if (documentType === "transaction" && !transactionId) {
      alert("Please select a transaction.");
      return;
    }

    // Validate file size (e.g., max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      alert(`File size exceeds the maximum limit of 10MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`);
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("file", file);
    
    // Add project_id or transaction_id based on document type
    if (documentType === "transaction") {
      formData.append("transaction_id", transactionId);
      // project_id is auto-filled by backend from transaction
      // Optionally add type field
      if (title.trim()) {
        formData.append("type", title.trim());
      }
    } else {
      formData.append("project_id", projectId);
    }

    try {
      setUploading(true);
      setError(""); // Clear any previous errors
      console.log("📤 Uploading document:", { 
        title: title.trim(), 
        documentType,
        project_id: documentType === "project" ? projectId : "auto-linked",
        transaction_id: documentType === "transaction" ? transactionId : null,
        fileName: file.name, 
        fileSize: file.size 
      });
      
      const response = await API.post("/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      console.log("✅ Document uploaded successfully:", response);
      
      // Reset form
      setTitle("");
      setFile(null);
      setProjectId("");
      setTransactionId("");
      setDocumentType("project");
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = "";
      }
      
      // Refresh documents list
      await fetchDocuments();
      
      // Show success message
      alert("Document uploaded successfully!");
    } catch (err) {
      console.error("❌ Upload error:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
        request: err.request,
      });
      
      // Handle different error types
      let errorMessage = "Failed to upload document. ";
      
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
        errorMessage = "You don't have permission to upload documents.";
      } else if (err.response.status === 413) {
        errorMessage = "File is too large. Please select a smaller file.";
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
      
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // ✅ Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await API.delete(`/documents/${id}`);
        fetchDocuments();
      } catch (err) {
        console.error("Error deleting document:", err);
        alert("Failed to delete document.");
      }
    }
  };

  if (loading)
    return (
      <div className="p-6">
        <p className="text-center text-gray-600">Loading documents...</p>
      </div>
    );
  
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-red-800 font-semibold">Error Loading Documents</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={fetchDocuments}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Public Documents</h1>
              <p className="text-blue-100 mt-1">Municipal documents and public records</p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-4">
          <div className="glass-effect bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
              <span className="text-white font-semibold">Total Documents: {documents.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Section - Admin Only */}
      {isAdmin ? (
        <div className="card-modern mb-6 animate-slideUp">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-600 rounded"></span>
            Upload New Document
          </h2>
          {error && error.includes("upload") && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Upload Error</p>
                  <p className="text-sm text-red-700 mt-1 whitespace-pre-line">{error}</p>
                </div>
                <button
                  onClick={() => setError("")}
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
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="documentType"
                    value="project"
                    checked={documentType === "project"}
                    onChange={(e) => {
                      setDocumentType(e.target.value);
                      setTransactionId("");
                    }}
                    disabled={uploading}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>Project Document</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="documentType"
                    value="transaction"
                    checked={documentType === "transaction"}
                    onChange={(e) => {
                      setDocumentType(e.target.value);
                      setProjectId("");
                    }}
                    disabled={uploading}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>Transaction Document (Proof of Payment)</span>
                </label>
              </div>
            </div>

            {documentType === "project" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project <span className="text-red-500">*</span>
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={uploading}
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction <span className="text-red-500">*</span>
                </label>
                <select
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={uploading}
                >
                  <option value="">Select a transaction</option>
                  {transactions.map((tx) => (
                    <option key={tx.id} value={tx.id}>
                      {tx.project?.title || "N/A"} - {tx.type} - ₱{parseFloat(tx.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({tx.transaction_date ? new Date(tx.transaction_date).toLocaleDateString() : "N/A"})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Project will be automatically linked to this transaction
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter document title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={uploading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.docx"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  setFile(selectedFile || null);
                  if (selectedFile) {
                    console.log("📎 File selected:", {
                      name: selectedFile.name,
                      size: selectedFile.size,
                      type: selectedFile.type
                    });
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={uploading}
              />
              {file && (
                <div className="mt-2 text-sm text-gray-600">
                  Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {uploading ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                "Upload Document"
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="text-center text-gray-500 italic">
            Admin access required to upload documents
          </div>
        </div>
      )}

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents Available</h3>
          <p className="text-gray-600">There are currently no documents in the system.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc, index) => (
            <div
              key={doc.id}
              className="card-modern overflow-hidden animate-scaleIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 text-white relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <h3 className="font-bold text-xl line-clamp-2">{doc.title}</h3>
                  {doc.transaction_id && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-yellow-400/20 text-yellow-200 rounded text-xs font-semibold">
                        Transaction Document
                      </span>
                    </div>
                  )}
                  {!doc.transaction_id && doc.project_id && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-400/20 text-blue-200 rounded text-xs font-semibold">
                        Project Document
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Uploaded</p>
                  <p className="text-sm text-gray-700">
                    {new Date(doc.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <a
                    href={`http://127.0.0.1:8000/storage/${doc.file_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium text-center"
                  >
                    View Document
                  </a>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                      title="Delete Document"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
