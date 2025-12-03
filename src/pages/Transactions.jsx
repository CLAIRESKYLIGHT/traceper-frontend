import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../utils/useAuth";

export default function Transactions() {
  const { isAdmin, userRole } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [officials, setOfficials] = useState([]);
  const [form, setForm] = useState({
    project_id: "",
    transaction_date: "",
    type: "Expense",
    amount: "",
    official_id: "",
    description: "",
  });
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [documentUploadError, setDocumentUploadError] = useState("");
  const [selectedTransactionForDoc, setSelectedTransactionForDoc] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [documentTitle, setDocumentTitle] = useState("");

  // Debug: Log admin status
  useEffect(() => {
    console.log("🔐 Admin Status:", { isAdmin, userRole });
  }, [isAdmin, userRole]);

  // ✅ Fetch all transactions with documents
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await API.get("/transactions");
      const transactionsData = response.data?.data || response.data || [];
      const transactionsArray = Array.isArray(transactionsData) ? transactionsData : [];
      
      // Check if documents are already included in the response
      const hasDocumentsInResponse = transactionsArray.some(tx => tx.documents !== undefined);
      
      if (hasDocumentsInResponse) {
        // Documents already included, use them directly
        setTransactions(transactionsArray.map(tx => ({
          ...tx,
          documents: tx.documents || []
        })));
      } else {
        // Documents not included, set empty array initially (lazy load on demand)
        setTransactions(transactionsArray.map(tx => ({
          ...tx,
          documents: [],
          documentsLoaded: false
        })));
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Lazy load documents for a specific transaction (only when needed)
  const loadTransactionDocuments = async (transactionId) => {
    const transaction = transactions.find(tx => tx.id === transactionId);
    if (!transaction) {
      return; // Transaction doesn't exist
    }

    try {
      // Fetch transaction with documents - backend includes documents in response
      const txResponse = await API.get(`/transactions/${transactionId}`);
      const txData = txResponse.data?.data || txResponse.data;
      // transaction.data.documents will have the auto-created document
      const documents = txData.documents || [];
      
      setTransactions(prev => prev.map(tx => 
        tx.id === transactionId 
          ? { ...tx, documents, documentsLoaded: true }
          : tx
      ));
    } catch (err) {
      console.error(`Error fetching documents for transaction ${transactionId}:`, err);
      setTransactions(prev => prev.map(tx => 
        tx.id === transactionId 
          ? { ...tx, documents: [], documentsLoaded: true }
          : tx
      ));
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

  // ✅ Refetch a specific project to get updated amount_spent (after trigger updates)
  const refetchProject = async (projectId) => {
    try {
      const response = await API.get(`/projects/${projectId}`);
      const projectData = response.data?.data || response.data;
      
      // Update the project in the projects list
      setProjects(prev => prev.map(proj => 
        proj.id === projectId ? projectData : proj
      ));
      
      console.log("✅ Project refetched with updated amount_spent:", projectData);
    } catch (err) {
      console.warn("⚠️ Failed to refetch project, but transaction was saved:", err);
      // Don't throw - transaction was successful, just refetch failed
    }
  };

  // ✅ Fetch officials for dropdown
  const fetchOfficials = async () => {
    try {
      const response = await API.get("/officials");
      const officialsData = response.data?.data || response.data || [];
      setOfficials(Array.isArray(officialsData) ? officialsData : []);
    } catch (err) {
      console.error("Error fetching officials:", err);
    }
  };

  useEffect(() => {
    // Fetch in parallel for better performance
    Promise.all([
      fetchTransactions(),
      fetchProjects(),
      fetchOfficials()
    ]).catch(err => {
      console.error("Error fetching initial data:", err);
    });
  }, []);

  // ✅ Handle form changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Helper function to format date to YYYY-MM-DD
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // ✅ Open edit modal
  const openEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setForm({
      project_id: transaction.project_id?.toString() || "",
      transaction_date: formatDateForInput(transaction.transaction_date),
      type: transaction.type || "Expense",
      amount: transaction.amount?.toString() || "",
      official_id: transaction.official_id?.toString() || "",
      description: transaction.description || "",
    });
    setSubmitError("");
  };

  // ✅ Helper to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // ✅ Close edit modal
  const closeEditModal = () => {
    setEditingTransaction(null);
    setForm({ 
      project_id: "", 
      transaction_date: "", // Empty - backend will default to today
      type: "Expense", 
      amount: "", 
      official_id: "",
      description: "" 
    });
    setSubmitError("");
  };

  // ✅ Add or Update transaction (admin only)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);

    // Validate required fields
    if (!form.project_id) {
      setSubmitError("Please select a project.");
      setSubmitting(false);
      return;
    }

    if (!form.amount || parseFloat(form.amount) <= 0) {
      setSubmitError("Please enter a valid amount greater than 0.");
      setSubmitting(false);
      return;
    }

    // Prepare data - format according to backend requirements
    const submitData = {
      project_id: parseInt(form.project_id), // Required: integer
      amount: parseFloat(form.amount), // Required: numeric, min: 0
      // transaction_date: optional, defaults to today if not provided
      // Format: YYYY-MM-DD
      ...(form.transaction_date ? { transaction_date: form.transaction_date } : {}),
      // official_id: optional integer or null
      // Only include if a value is selected (backend may not have this column yet)
      ...(form.official_id ? { official_id: parseInt(form.official_id) } : {}),
      // description: optional string or null
      description: form.description.trim() || null,
    };

    try {
      console.log("📤 Submitting transaction:", submitData);
      
      let projectId = submitData.project_id;
      
      if (editingTransaction) {
        const response = await API.put(`/transactions/${editingTransaction.id}`, submitData);
        console.log("✅ Transaction updated:", response);
        
        // Get project_id from response or use the one from form
        projectId = response.data?.data?.project_id || submitData.project_id;
      } else {
        const response = await API.post("/transactions", submitData);
        console.log("✅ Transaction created:", response);
        
        // Get project_id from response or use the one from form
        projectId = response.data?.data?.project_id || submitData.project_id;
      }
      
      // IMPORTANT: Refetch project to get updated amount_spent (trigger updated it)
      if (projectId) {
        await refetchProject(projectId);
      }
      
      // Reset form
      setForm({ 
        project_id: "", 
        transaction_date: "", // Empty - backend will default to today
        type: "Expense", 
        amount: "", 
        official_id: "",
        description: "" 
      });
      setEditingTransaction(null);
      await fetchTransactions();
      
      // Show success message
      alert(editingTransaction ? "Transaction updated successfully!" : "Transaction added successfully!");
    } catch (err) {
      console.error("❌ Error saving transaction:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
        request: err.request,
      });
      
      // Handle different error types
      let errorMessage = "Failed to save transaction. ";
      
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

  // ✅ Delete transaction
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        // First, get the transaction to know which project to refetch
        const transaction = transactions.find(tx => tx.id === id);
        const projectId = transaction?.project_id;
        
        // Delete the transaction
        await API.delete(`/transactions/${id}`);
        
        // IMPORTANT: Refetch project to get updated amount_spent (trigger updated it)
        if (projectId) {
          await refetchProject(projectId);
        }
        
        await fetchTransactions();
        alert("Transaction deleted successfully!");
      } catch (err) {
        console.error("❌ Error deleting transaction:", err);
        const errorMessage = err.response?.data?.message 
          || err.response?.data?.error 
          || err.message 
          || "Failed to delete transaction.";
        alert(errorMessage);
      }
    }
  };

  // ✅ Open document upload modal
  const openDocumentUpload = async (transaction) => {
    setSelectedTransactionForDoc(transaction);
    setDocumentFile(null);
    setDocumentTitle("");
    setDocumentUploadError("");

    // Load transaction with documents to get placeholder document
    try {
      const txResponse = await API.get(`/transactions/${transaction.id}`);
      const txData = txResponse.data?.data || txResponse.data;
      const documents = txData.documents || [];
      
      // Update transaction in state with documents
      setTransactions(prev => prev.map(tx => 
        tx.id === transaction.id 
          ? { ...tx, documents, documentsLoaded: true }
          : tx
      ));

      // Check if there's a placeholder document (document without file_path or with empty file_path)
      const placeholderDoc = documents.find(doc => !doc.file_path || doc.file_path === '');
      if (placeholderDoc) {
        // Pre-fill with placeholder document info
        setSelectedTransactionForDoc({ ...transaction, placeholderDocumentId: placeholderDoc.id, documents });
      }
    } catch (err) {
      console.error("Error loading transaction documents:", err);
    }
  };

  // ✅ Close document upload modal
  const closeDocumentUpload = () => {
    setSelectedTransactionForDoc(null);
    setDocumentFile(null);
    setDocumentTitle("");
    setDocumentUploadError("");
  };

  // ✅ Handle document upload for transaction
  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    
    if (!documentFile) {
      setDocumentUploadError("Please select a file to upload.");
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (documentFile.size > maxSize) {
      setDocumentUploadError(`File size exceeds the maximum limit of 10MB. Your file is ${(documentFile.size / 1024 / 1024).toFixed(2)}MB.`);
      return;
    }

    try {
      setUploadingDocument(true);
      setDocumentUploadError("");

      // Get the transaction with documents to find placeholder
      const txResponse = await API.get(`/transactions/${selectedTransactionForDoc.id}`);
      const txData = txResponse.data?.data || txResponse.data;
      const documents = txData.documents || [];
      
      // Find placeholder document (document without file_path or with empty file_path)
      const placeholderDoc = documents.find(doc => !doc.file_path || doc.file_path === '');

      if (placeholderDoc) {
        // Update the auto-created placeholder document with file
        console.log("📤 Updating placeholder document with file:", placeholderDoc.id);
        
        const formData = new FormData();
        formData.append("file", documentFile);
        if (documentTitle) {
          formData.append("type", documentTitle.trim()); // Optional
        }

        await API.put(`/documents/${placeholderDoc.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        console.log("✅ File uploaded to placeholder document successfully");
      } else {
        // No placeholder found, create new document
        // ✅ You only need to send transaction_id - project_id is auto-filled!
        console.log("📤 Creating new document for transaction");
        
        const formData = new FormData();
        formData.append("transaction_id", selectedTransactionForDoc.id); // Only this is needed!
        formData.append("title", documentTitle.trim() || "Transaction Document");
        if (documentTitle) {
          formData.append("type", documentTitle.trim());
        }
        formData.append("file", documentFile);

        await API.post("/documents", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        console.log("✅ New document created successfully");
      }

      // Reload transaction documents
      await loadTransactionDocuments(selectedTransactionForDoc.id);
      
      // Reset form and close modal
      closeDocumentUpload();
      
      alert("Document uploaded successfully!");
    } catch (err) {
      console.error("❌ Document upload error:", err);
      
      let errorMessage = "Failed to upload document. ";
      if (!err.response) {
        errorMessage += "Cannot connect to the server.";
      } else if (err.response.status === 401) {
        errorMessage = "You are not authorized. Please log in again.";
      } else if (err.response.status === 403) {
        errorMessage = "You don't have permission to upload documents.";
      } else if (err.response.status === 413) {
        errorMessage = "File is too large. Please select a smaller file.";
      } else if (err.response.status === 422) {
        const errors = err.response.data?.errors;
        if (errors) {
          errorMessage = Object.entries(errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`)
            .join("\n");
        } else {
          errorMessage = err.response.data?.message || "Validation failed.";
        }
      } else {
        errorMessage = err.response.data?.message || errorMessage;
      }
      
      setDocumentUploadError(errorMessage);
    } finally {
      setUploadingDocument(false);
    }
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

  // Calculate totals
  const totalIncome = transactions
    .filter(tx => tx.type === "Income")
    .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);
  const totalExpense = transactions
    .filter(tx => tx.type === "Expense")
    .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);
  const netAmount = totalIncome - totalExpense;

  return (
    <div className="p-6 min-h-screen animate-fadeIn">
      {/* Modern Header */}
      <div className="card-modern bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 shadow-xl mb-6 animate-slideDown">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-yellow-400/30 animate-float">
            <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Financial Transactions</h1>
            <p className="text-blue-100 mt-1">Project income and expense records</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-effect bg-green-500/20 backdrop-blur-md rounded-xl p-5 border border-green-300/30 hover:scale-105 transition-transform duration-300">
            <p className="text-xs text-green-100 uppercase tracking-wider font-semibold mb-2">Total Income</p>
            <p className="text-3xl font-bold text-white">₱{totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="glass-effect bg-red-500/20 backdrop-blur-md rounded-xl p-5 border border-red-300/30 hover:scale-105 transition-transform duration-300">
            <p className="text-xs text-red-100 uppercase tracking-wider font-semibold mb-2">Total Expense</p>
            <p className="text-3xl font-bold text-white">₱{totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className={`glass-effect backdrop-blur-md rounded-xl p-5 border hover:scale-105 transition-transform duration-300 ${
            netAmount >= 0 
              ? 'bg-blue-500/20 border-blue-300/30' 
              : 'bg-orange-500/20 border-orange-300/30'
          }`}>
            <p className="text-xs text-white/80 uppercase tracking-wider font-semibold mb-2">Net Amount</p>
            <p className="text-3xl font-bold text-white">
              ₱{netAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Add/Edit Transaction Form - Admin Only */}
      {isAdmin ? (
        <div className="card-modern mb-6 animate-slideUp">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-600 rounded"></span>
            {editingTransaction ? "Edit Transaction" : "Add New Transaction"}
          </h2>
          {submitError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-4">
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
          {editingTransaction && (
            <div className="mb-4 flex justify-end">
              <button
                onClick={closeEditModal}
                className="text-sm text-gray-600 hover:text-gray-800"
                type="button"
              >
                Cancel Edit
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project <span className="text-red-500">*</span>
              </label>
              <select
                name="project_id"
                value={form.project_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={submitting}
              >
                <option value="">Select Project</option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Date
              </label>
              <input
                type="date"
                name="transaction_date"
                value={form.transaction_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={submitting}
                title="Leave empty to use today's date"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to use today's date</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={submitting}
              >
                <option value="Expense">Expense</option>
                <option value="Income">Income</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                placeholder="0.00"
                value={form.amount}
                onChange={handleChange}
                step="0.01"
                min="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Official</label>
              <select
                name="official_id"
                value={form.official_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={submitting}
              >
                <option value="">Select Official (Optional)</option>
                {officials.map((official) => (
                  <option key={official.id} value={official.id}>
                    {official.name} - {official.position}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                name="description"
                placeholder="Transaction description (optional)"
                value={form.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={submitting}
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex gap-3">
              {editingTransaction && (
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {editingTransaction ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  editingTransaction ? "Update Transaction" : "Add Transaction"
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="text-center text-gray-500 italic">
            Admin access required to add transactions
          </div>
        </div>
      )}

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Transactions Found</h3>
          <p className="text-gray-600">There are currently no transactions recorded.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx, index) => (
            <div
              key={tx.id}
              className="card-modern animate-scaleIn"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      tx.type === "Income" ? "bg-green-100" : "bg-red-100"
                    }`}>
                      <svg className={`w-6 h-6 ${tx.type === "Income" ? "text-green-600" : "text-red-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {tx.type === "Income" ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                        )}
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{tx.project?.title || "N/A"}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          tx.type === "Income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {tx.type}
                        </span>
                      </div>
                      {tx.description && (
                        <p className="text-sm text-gray-600 mb-2">{tx.description}</p>
                      )}
                      <div className="space-y-1">
                        {tx.official && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <p className="text-xs text-gray-600">
                              Authorized by: <span className="font-semibold">{tx.official.name}</span> ({tx.official.position})
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-gray-500">
                          {tx.transaction_date ? new Date(tx.transaction_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : new Date(tx.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Documents Section */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {!tx.documentsLoaded && tx.documents?.length === 0 && (
                      <button
                        onClick={() => loadTransactionDocuments(tx.id)}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Load Documents
                      </button>
                    )}
                    {tx.documents && tx.documents.length > 0 && (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-sm font-semibold text-gray-700">Supporting Documents ({tx.documents.length})</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {tx.documents.map((doc) => (
                            <a
                              key={doc.id}
                              href={`http://127.0.0.1:8000/storage/${doc.file_path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              <span>{doc.title}</span>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${
                      tx.type === "Income" ? "text-green-600" : "text-red-600"
                    }`}>
                      {tx.type === "Income" ? "+" : "-"}₱{parseFloat(tx.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openDocumentUpload(tx)}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Upload Document"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </button>
                      <button
                        onClick={() => openEditModal(tx)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Transaction"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Transaction"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Upload Modal */}
      {selectedTransactionForDoc && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="card-modern w-full max-w-md animate-scaleIn">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold gradient-text">
                Upload Document for Transaction
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedTransactionForDoc.project?.title || "N/A"} - {selectedTransactionForDoc.type} - ₱{parseFloat(selectedTransactionForDoc.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <form onSubmit={handleDocumentUpload} className="p-6 space-y-4">
              {documentUploadError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">Error</p>
                      <p className="text-sm text-red-700 mt-1 whitespace-pre-line">{documentUploadError}</p>
                    </div>
                    <button
                      onClick={() => setDocumentUploadError("")}
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
                  Document Type/Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., receipt, invoice (optional)"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={uploadingDocument}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {selectedTransactionForDoc?.placeholderDocumentId 
                    ? "Updating placeholder document with file"
                    : "Will create new document if no placeholder exists"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.docx"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    setDocumentFile(selectedFile || null);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={uploadingDocument}
                />
                {documentFile && (
                  <div className="mt-2 text-sm text-gray-600">
                    Selected: {documentFile.name} ({(documentFile.size / 1024).toFixed(2)} KB)
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeDocumentUpload}
                  className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  disabled={uploadingDocument}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-modern flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={uploadingDocument}
                >
                  {uploadingDocument ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload Document
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
