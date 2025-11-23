import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../utils/useAuth";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import SearchBar from "../components/SearchBar";
import RevenueExpenseChart from "../components/charts/RevenueExpenseChart";
import FinancialChart from "../components/charts/FinancialChart";
import TransactionTypeChart from "../components/charts/TransactionTypeChart";

export default function Financials() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("transactions"); // "transactions" or "records"
  
  // Transactions state
  const [transactions, setTransactions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [officials, setOfficials] = useState([]);
  const [transactionForm, setTransactionForm] = useState({
    project_id: "",
    transaction_date: "",
    type: "Expense",
    amount: "",
    official_id: "",
    description: "",
  });
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionLoading, setTransactionLoading] = useState(true);
  const [transactionError, setTransactionError] = useState("");
  const [submittingTransaction, setSubmittingTransaction] = useState(false);
  const [submitTransactionError, setSubmitTransactionError] = useState("");
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [documentUploadError, setDocumentUploadError] = useState("");
  const [selectedTransactionForDoc, setSelectedTransactionForDoc] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");

  // Toast and Confirmation Modal state
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "danger"
  });

  // Financial Records state
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [recordsError, setRecordsError] = useState("");
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordFormData, setRecordFormData] = useState({
    year: "",
    total_revenue: "",
    ira_allocation: "",
    service_business_income: "",
    local_tax_collections: "",
    total_expenditures: "",
    personnel_services: "",
    maintenance_operating_expenses: "",
    capital_outlay: "",
    fiscal_balance: "",
    total_assets: "",
    total_liabilities: "",
    net_equity: "",
  });
  const [submittingRecord, setSubmittingRecord] = useState(false);

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setTransactionLoading(true);
      setTransactionError("");
      const response = await API.get("/transactions");
      console.log("Transactions API response:", response.data);
      
      const transactionsData = response.data?.data || response.data || [];
      const transactionsArray = Array.isArray(transactionsData) ? transactionsData : [];
      
      console.log("Processed transactions array:", transactionsArray);
      console.log("Number of transactions:", transactionsArray.length);
      
      const hasDocumentsInResponse = transactionsArray.some(tx => tx.documents !== undefined);
      
      if (hasDocumentsInResponse) {
        setTransactions(transactionsArray.map(tx => ({
          ...tx,
          documents: tx.documents || []
        })));
      } else {
        setTransactions(transactionsArray.map(tx => ({
          ...tx,
          documents: [],
          documentsLoaded: false
        })));
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setTransactionError(err.response?.data?.message || "Failed to load transactions.");
      setTransactions([]); // Set empty array on error
    } finally {
      setTransactionLoading(false);
    }
  };

  const loadTransactionDocuments = async (transactionId) => {
    const transaction = transactions.find(tx => tx.id === transactionId);
    if (!transaction) return;

    try {
      const txResponse = await API.get(`/transactions/${transactionId}`);
      const txData = txResponse.data?.data || txResponse.data;
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

  const fetchProjects = async () => {
    try {
      const response = await API.get("/projects");
      const projectsData = response.data?.data || response.data || [];
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const fetchOfficials = async () => {
    try {
      const response = await API.get("/officials");
      const officialsData = response.data?.data || response.data || [];
      setOfficials(Array.isArray(officialsData) ? officialsData : []);
    } catch (err) {
      console.error("Error fetching officials:", err);
    }
  };

  // Fetch financial records
  const fetchRecords = async () => {
    try {
      setRecordsLoading(true);
      const response = await API.get("/financial-records");
      const recordsData = response.data?.data || response.data || [];
      setRecords(Array.isArray(recordsData) ? recordsData : []);
    } catch (err) {
      console.error("Error fetching financial records:", err);
      setRecordsError("Failed to load financial records.");
    } finally {
      setRecordsLoading(false);
    }
  };

  const fetchRecordByYear = async (year) => {
    try {
      const response = await API.get(`/financial-records/year/${year}`);
      const recordData = response.data?.data || response.data;
      setSelectedRecord(recordData);
    } catch (err) {
      console.error("Error fetching record by year:", err);
      setSelectedRecord(null);
    }
  };

  useEffect(() => {
    if (activeTab === "transactions") {
      Promise.all([
        fetchTransactions(),
        fetchProjects(),
        fetchOfficials(),
        fetchRecords() // Also fetch records to show total municipal revenue
      ]).catch(err => {
        console.error("Error fetching transaction data:", err);
      });
    } else {
      fetchRecords();
    }
  }, [activeTab]);

  // Transaction handlers
  const handleTransactionChange = (e) => {
    setTransactionForm({ ...transactionForm, [e.target.name]: e.target.value });
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const openTransactionModal = (transaction = null) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setTransactionForm({
        project_id: transaction.project_id?.toString() || "",
        transaction_date: formatDateForInput(transaction.transaction_date),
        type: transaction.type || "Expense",
        amount: transaction.amount?.toString() || "",
        official_id: transaction.official_id?.toString() || "",
        description: transaction.description || "",
      });
    } else {
      setEditingTransaction(null);
      setTransactionForm({
        project_id: "",
        transaction_date: "",
        type: "Expense",
        amount: "",
        official_id: "",
        description: "",
      });
    }
    setSubmitTransactionError("");
    setShowTransactionModal(true);
  };

  const closeTransactionModal = () => {
    setShowTransactionModal(false);
    setEditingTransaction(null);
    setTransactionForm({ 
      project_id: "", 
      transaction_date: "",
      type: "Expense", 
      amount: "", 
      official_id: "",
      description: "" 
    });
    setSubmitTransactionError("");
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    setSubmitTransactionError("");
    setSubmittingTransaction(true);

    if (!transactionForm.project_id) {
      setSubmitTransactionError("Please select a project.");
      setSubmittingTransaction(false);
      return;
    }

    if (!transactionForm.amount || parseFloat(transactionForm.amount) <= 0) {
      setSubmitTransactionError("Please enter a valid amount greater than 0.");
      setSubmittingTransaction(false);
      return;
    }

    const submitData = {
      project_id: parseInt(transactionForm.project_id),
      amount: parseFloat(transactionForm.amount),
      type: transactionForm.type || "Expense", // Include type field
      ...(transactionForm.transaction_date ? { transaction_date: transactionForm.transaction_date } : {}),
      ...(transactionForm.official_id ? { official_id: parseInt(transactionForm.official_id) } : {}),
      description: transactionForm.description.trim() || null,
    };

    try {
      if (editingTransaction && editingTransaction.id) {
        console.log("Updating transaction:", editingTransaction.id, submitData);
        await API.put(`/transactions/${editingTransaction.id}`, submitData);
        setToast({ message: "Transaction updated successfully!", type: "success" });
      } else {
        console.log("Creating new transaction:", submitData);
        await API.post("/transactions", submitData);
        setToast({ message: "Transaction added successfully!", type: "success" });
      }
      
      setTransactionForm({ 
        project_id: "", 
        transaction_date: "",
        type: "Expense", 
        amount: "", 
        official_id: "",
        description: "" 
      });
      setEditingTransaction(null);
      await fetchTransactions();
      closeTransactionModal();
    } catch (err) {
      console.error("Error saving transaction:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      
      let errorMessage = "Failed to save transaction. ";
      if (err.response?.status === 401) {
        errorMessage = "You are not authorized. Please log in again.";
      } else if (err.response?.status === 403) {
        errorMessage = "You don't have permission to perform this action.";
      } else if (err.response?.status === 422) {
        const errors = err.response.data?.errors;
        if (errors) {
          errorMessage = Object.entries(errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`)
            .join("\n");
        } else {
          errorMessage = err.response.data?.message || "Validation failed.";
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      setSubmitTransactionError(errorMessage);
    } finally {
      setSubmittingTransaction(false);
    }
  };

  const handleDeleteTransaction = (id) => {
    const transaction = transactions.find(tx => tx.id === id);
    setConfirmModal({
      isOpen: true,
      title: "Delete Transaction",
      message: `Are you sure you want to delete this transaction? This action cannot be undone.${transaction ? `\n\nProject: ${transaction.project?.title || "N/A"}\nAmount: ₱${parseFloat(transaction.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ""}`,
      type: "danger",
      onConfirm: async () => {
        try {
          await API.delete(`/transactions/${id}`);
          await fetchTransactions();
          setToast({ message: "Transaction deleted successfully!", type: "success" });
        } catch (err) {
          console.error("Error deleting transaction:", err);
          setToast({ message: err.response?.data?.message || "Failed to delete transaction.", type: "error" });
        }
      }
    });
  };

  const openDocumentUpload = async (transaction) => {
    setSelectedTransactionForDoc(transaction);
    setDocumentFile(null);
    setDocumentTitle("");
    setDocumentUploadError("");

    try {
      const txResponse = await API.get(`/transactions/${transaction.id}`);
      const txData = txResponse.data?.data || txResponse.data;
      const documents = txData.documents || [];
      
      setTransactions(prev => prev.map(tx => 
        tx.id === transaction.id 
          ? { ...tx, documents, documentsLoaded: true }
          : tx
      ));

      const placeholderDoc = documents.find(doc => !doc.file_path || doc.file_path === '');
      if (placeholderDoc) {
        setSelectedTransactionForDoc({ ...transaction, placeholderDocumentId: placeholderDoc.id, documents });
      }
    } catch (err) {
      console.error("Error loading transaction documents:", err);
    }
  };

  const closeDocumentUpload = () => {
    setSelectedTransactionForDoc(null);
    setDocumentFile(null);
    setDocumentTitle("");
    setDocumentUploadError("");
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    
    if (!documentFile) {
      setDocumentUploadError("Please select a file to upload.");
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (documentFile.size > maxSize) {
      setDocumentUploadError(`File size exceeds the maximum limit of 10MB. Your file is ${(documentFile.size / 1024 / 1024).toFixed(2)}MB.`);
      return;
    }

    try {
      setUploadingDocument(true);
      setDocumentUploadError("");

      const txResponse = await API.get(`/transactions/${selectedTransactionForDoc.id}`);
      const txData = txResponse.data?.data || txResponse.data;
      const documents = txData.documents || [];
      
      const placeholderDoc = documents.find(doc => !doc.file_path || doc.file_path === '');

      if (placeholderDoc) {
        const formData = new FormData();
        formData.append("file", documentFile);
        if (documentTitle) {
          formData.append("type", documentTitle.trim());
        }

        await API.put(`/documents/${placeholderDoc.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        const formData = new FormData();
        formData.append("transaction_id", selectedTransactionForDoc.id);
        formData.append("title", documentTitle.trim() || "Transaction Document");
        if (documentTitle) {
          formData.append("type", documentTitle.trim());
        }
        formData.append("file", documentFile);

        await API.post("/documents", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await loadTransactionDocuments(selectedTransactionForDoc.id);
      closeDocumentUpload();
      setToast({ message: "Document uploaded successfully!", type: "success" });
    } catch (err) {
      console.error("Document upload error:", err);
      let errorMessage = "Failed to upload document. ";
      if (err.response?.status === 401) {
        errorMessage = "You are not authorized.";
      } else if (err.response?.status === 403) {
        errorMessage = "You don't have permission.";
      } else if (err.response?.status === 413) {
        errorMessage = "File is too large.";
      } else {
        errorMessage = err.response?.data?.message || errorMessage;
      }
      setDocumentUploadError(errorMessage);
    } finally {
      setUploadingDocument(false);
    }
  };

  // Financial Records handlers
  const handleYearChange = (year) => {
    setSelectedYear(year);
    if (year) {
      fetchRecordByYear(year);
    } else {
      setSelectedRecord(null);
    }
  };

  const openRecordModal = (record = null) => {
    if (record) {
      setRecordFormData({
        year: record.year?.toString() || "",
        total_revenue: record.total_revenue?.toString() || "",
        ira_allocation: record.ira_allocation?.toString() || "",
        service_business_income: record.service_business_income?.toString() || "",
        local_tax_collections: record.local_tax_collections?.toString() || "",
        total_expenditures: record.total_expenditures?.toString() || "",
        personnel_services: record.personnel_services?.toString() || "",
        maintenance_operating_expenses: record.maintenance_operating_expenses?.toString() || "",
        capital_outlay: record.capital_outlay?.toString() || "",
        fiscal_balance: record.fiscal_balance?.toString() || "",
        total_assets: record.total_assets?.toString() || "",
        total_liabilities: record.total_liabilities?.toString() || "",
        net_equity: record.net_equity?.toString() || "",
      });
    } else {
      setRecordFormData({
        year: "",
        total_revenue: "",
        ira_allocation: "",
        service_business_income: "",
        local_tax_collections: "",
        total_expenditures: "",
        personnel_services: "",
        maintenance_operating_expenses: "",
        capital_outlay: "",
        fiscal_balance: "",
        total_assets: "",
        total_liabilities: "",
        net_equity: "",
      });
    }
    setSelectedRecord(record);
    setShowRecordModal(true);
  };

  const closeRecordModal = () => {
    setShowRecordModal(false);
    setSelectedRecord(null);
    setRecordFormData({
      year: "",
      total_revenue: "",
      ira_allocation: "",
      service_business_income: "",
      local_tax_collections: "",
      total_expenditures: "",
      personnel_services: "",
      maintenance_operating_expenses: "",
      capital_outlay: "",
      fiscal_balance: "",
      total_assets: "",
      total_liabilities: "",
      net_equity: "",
    });
  };

  const handleRecordChange = (e) => {
    setRecordFormData({ ...recordFormData, [e.target.name]: e.target.value });
  };

  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    setSubmittingRecord(true);

    const submitData = {
      year: parseInt(recordFormData.year),
      total_revenue: parseFloat(recordFormData.total_revenue) || 0,
      ira_allocation: parseFloat(recordFormData.ira_allocation) || 0,
      service_business_income: parseFloat(recordFormData.service_business_income) || 0,
      local_tax_collections: parseFloat(recordFormData.local_tax_collections) || 0,
      total_expenditures: parseFloat(recordFormData.total_expenditures) || 0,
      personnel_services: parseFloat(recordFormData.personnel_services) || 0,
      maintenance_operating_expenses: parseFloat(recordFormData.maintenance_operating_expenses) || 0,
      capital_outlay: parseFloat(recordFormData.capital_outlay) || 0,
      fiscal_balance: parseFloat(recordFormData.fiscal_balance) || 0,
      total_assets: parseFloat(recordFormData.total_assets) || 0,
      total_liabilities: parseFloat(recordFormData.total_liabilities) || 0,
      net_equity: parseFloat(recordFormData.net_equity) || 0,
    };

    try {
      if (selectedRecord && selectedRecord.id) {
        console.log("Updating financial record:", selectedRecord.id, submitData);
        await API.put(`/financial-records/${selectedRecord.id}`, submitData);
        setToast({ message: "Financial record updated successfully!", type: "success" });
      } else {
        console.log("Creating new financial record:", submitData);
        await API.post("/financial-records", submitData);
        setToast({ message: "Financial record created successfully!", type: "success" });
      }
      await fetchRecords();
      // If we were viewing a record by year, refresh it
      if (selectedRecord && selectedRecord.year) {
        await fetchRecordByYear(selectedRecord.year);
      }
      closeRecordModal();
    } catch (err) {
      console.error("Error saving financial record:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      
      let errorMessage = "Failed to save financial record.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.status === 422) {
        errorMessage = "Validation error. Please check your input.";
      }
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setSubmittingRecord(false);
    }
  };

  const handleDeleteRecord = (id) => {
    const record = records.find(r => r.id === id);
    setConfirmModal({
      isOpen: true,
      title: "Delete Financial Record",
      message: `Are you sure you want to delete the financial record for ${record?.year || "this year"}? This action cannot be undone.`,
      type: "danger",
      onConfirm: async () => {
        try {
          await API.delete(`/financial-records/${id}`);
          await fetchRecords();
          if (selectedRecord && selectedRecord.id === id) {
            setSelectedRecord(null);
            setSelectedYear(null);
          }
          setToast({ message: "Financial record deleted successfully!", type: "success" });
        } catch (err) {
          console.error("Error deleting financial record:", err);
          setToast({ message: err.response?.data?.message || "Failed to delete financial record.", type: "error" });
        }
      }
    });
  };

  // Calculate transaction totals (project-level)
  const projectIncome = transactions
    .filter(tx => tx.type === "Income" || tx.type === "income")
    .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);
  const totalExpense = transactions
    .filter(tx => tx.type === "Expense" || tx.type === "expense" || !tx.type)
    .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);
  const netAmount = projectIncome - totalExpense;

  // Get municipal revenue - use current year, or most recent year if current year doesn't exist
  const currentYear = new Date().getFullYear();
  let currentYearRecord = records.find(r => r.year === currentYear);
  
  // If no record for current year, use the most recent year
  if (!currentYearRecord && records.length > 0) {
    const sortedRecords = [...records].sort((a, b) => b.year - a.year);
    currentYearRecord = sortedRecords[0];
  }
  
  const totalMunicipalRevenue = currentYearRecord?.total_revenue || 0;
  const revenueYear = currentYearRecord?.year || currentYear;
  
  // Calculate remaining revenue after expenses
  const remainingRevenue = totalMunicipalRevenue - totalExpense;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Financials</h1>
          <p className="text-lg text-gray-600">Municipal financial records and transactions</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("transactions")}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === "transactions"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Transactions
                </span>
              </button>
              <button
                onClick={() => setActiveTab("records")}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === "records"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Annual Records
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <>
            {transactionLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-32 bg-gray-200 rounded-xl"></div>
                <div className="h-64 bg-gray-200 rounded-xl"></div>
              </div>
            ) : transactionError ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <p className="text-red-800 font-medium">{transactionError}</p>
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Municipal Revenue</p>
                    <p className="text-xs text-gray-400 mb-2">({revenueYear} - IRA, Taxes, Services)</p>
                    {totalMunicipalRevenue === 0 && records.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No financial records available</p>
                    ) : totalMunicipalRevenue === 0 ? (
                      <p className="text-sm text-orange-600">No revenue data for {revenueYear}</p>
                    ) : (
                      <p className="text-2xl font-bold text-blue-600">
                        ₱{totalMunicipalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Expenses</p>
                    <p className="text-xs text-gray-400 mb-2">(From all transactions)</p>
                    <p className="text-2xl font-bold text-red-600">
                      ₱{totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <p className="text-sm font-medium text-gray-500 mb-1">Remaining Revenue</p>
                    <p className="text-xs text-gray-400 mb-2">(Revenue - Expenses)</p>
                    {totalMunicipalRevenue === 0 ? (
                      <p className="text-sm text-gray-500 italic">N/A</p>
                    ) : (
                      <p className={`text-2xl font-bold ${remainingRevenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₱{remainingRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <p className="text-sm font-medium text-gray-500 mb-1">Project Income</p>
                    <p className="text-xs text-gray-400 mb-2">(Income transactions only)</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₱{projectIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {/* Transaction Type Chart */}
                {transactions.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Income vs Expenses Breakdown</h3>
                    <TransactionTypeChart transactions={transactions} />
                  </div>
                )}

                {/* Add Transaction Button - Admin Only */}
                {isAdmin && (
                  <div className="mb-8 flex justify-end">
                    <button
                      onClick={() => openTransactionModal()}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Transaction
                    </button>
                  </div>
                )}

                {/* Search and Filters */}
                <div className="mb-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <SearchBar
                        placeholder="Search transactions by project, description, or amount..."
                        onSearch={setSearchTerm}
                        value={searchTerm}
                      />
                    </div>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                      <option value="">All Types</option>
                      <option value="Income">Income</option>
                      <option value="Expense">Expense</option>
                    </select>
                  </div>
                  {(searchTerm || filterType) && (
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
                      {filterType && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          Type: {filterType}
                          <button
                            onClick={() => setFilterType("")}
                            className="hover:text-green-900"
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
                          setFilterType("");
                        }}
                        className="text-sm text-gray-600 hover:text-gray-900 underline"
                      >
                        Clear all
                      </button>
                    </div>
                  )}
                </div>

                {/* Transactions List */}
                {(() => {
                  if (!Array.isArray(transactions)) {
                    console.error("Transactions is not an array:", transactions);
                    return (
                      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                        <p className="text-red-800 font-medium">Error: Transactions data is invalid</p>
                      </div>
                    );
                  }

                  const filteredTransactions = transactions.filter((tx) => {
                    if (!tx) return false;
                    
                    const matchesSearch = !searchTerm || 
                      tx.project?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      tx.amount?.toString().includes(searchTerm) ||
                      tx.official?.name?.toLowerCase().includes(searchTerm.toLowerCase());
                    
                    const matchesType = !filterType || tx.type === filterType;
                    
                    return matchesSearch && matchesType;
                  });

                  return filteredTransactions.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {transactions.length === 0 ? "No Transactions Found" : "No Transactions Match Your Search"}
                    </h3>
                    <p className="text-gray-600">
                      {transactions.length === 0 
                        ? "There are currently no transactions recorded."
                        : "Try adjusting your search or filter criteria."}
                    </p>
                  </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTransactions.map((tx) => (
                      <div key={tx.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
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
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    tx.type === "Income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                  }`}>
                                    {tx.type}
                                  </span>
                                </div>
                                {tx.description && (
                                  <p className="text-sm text-gray-600 mb-2">{tx.description}</p>
                                )}
                                <p className="text-xs text-gray-500">
                                  {tx.transaction_date ? new Date(tx.transaction_date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  }) : new Date(tx.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                            
                            {/* Documents Section */}
                            <div className="mt-4 pt-4 border-t border-gray-100">
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
                                <div className="space-y-2">
                                  <p className="text-sm font-semibold text-gray-700">Supporting Documents ({tx.documents.length})</p>
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
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span>{doc.title}</span>
                                      </a>
                                    ))}
                                  </div>
                                </div>
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
                                  onClick={() => openTransactionModal(tx)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit Transaction"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteTransaction(tx.id)}
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
                  );
                })()}
              </>
            )}
          </>
        )}

        {/* Financial Records Tab */}
        {activeTab === "records" && (
          <>
            {recordsLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-32 bg-gray-200 rounded-xl"></div>
                <div className="h-64 bg-gray-200 rounded-xl"></div>
              </div>
            ) : recordsError ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <p className="text-red-800 font-medium">{recordsError}</p>
              </div>
            ) : (
              <>
                {/* Header with Add Button */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Annual Financial Records</h2>
                    <p className="text-gray-600 mt-1">Municipal-level financial summaries by year</p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => openRecordModal()}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Record
                    </button>
                  )}
                </div>

                {/* Year Filter */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-semibold text-gray-700">View Record by Year:</label>
                    <select
                      value={selectedYear || ""}
                      onChange={(e) => handleYearChange(e.target.value ? parseInt(e.target.value) : null)}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                    >
                      <option value="">Select Year</option>
                      {records.map((record) => (
                        <option key={record.year} value={record.year}>
                          {record.year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Financial Trends Chart */}
                {records.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Trends Over Years</h3>
                    <RevenueExpenseChart records={records} />
                  </div>
                )}

                {/* Selected Record Details */}
                {selectedRecord && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-gray-900">Financial Record - {selectedRecord.year}</h3>
                      {isAdmin && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => openRecordModal(selectedRecord)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(selectedRecord.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="p-6 bg-green-50 rounded-lg border border-green-100">
                        <p className="text-sm font-medium text-gray-600 mb-2">Total Revenue</p>
                        <p className="text-3xl font-bold text-gray-900">
                          ₱{(selectedRecord.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="p-6 bg-red-50 rounded-lg border border-red-100">
                        <p className="text-sm font-medium text-gray-600 mb-2">Total Expenditures</p>
                        <p className="text-3xl font-bold text-gray-900">
                          ₱{(selectedRecord.total_expenditures || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="p-6 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm font-medium text-gray-600 mb-2">Fiscal Balance</p>
                        <p className={`text-3xl font-bold ${selectedRecord.fiscal_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ₱{(selectedRecord.fiscal_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-100">
                        <p className="text-sm font-medium text-gray-600 mb-2">IRA Allocation</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ₱{(selectedRecord.ira_allocation || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="p-6 bg-purple-50 rounded-lg border border-purple-100">
                        <p className="text-sm font-medium text-gray-600 mb-2">Total Assets</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ₱{(selectedRecord.total_assets || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="p-6 bg-orange-50 rounded-lg border border-orange-100">
                        <p className="text-sm font-medium text-gray-600 mb-2">Net Equity</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ₱{(selectedRecord.net_equity || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Records List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">All Financial Records</h3>
                  {records.length === 0 ? (
                    <p className="text-gray-500 text-center py-12">No financial records found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Year</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Expenditures</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Balance</th>
                            {isAdmin && (
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {records.map((record) => (
                            <tr key={record.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.year}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ₱{(record.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ₱{(record.total_expenditures || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                                record.fiscal_balance >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                ₱{(record.fiscal_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              {isAdmin && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <button
                                    onClick={() => handleYearChange(record.year)}
                                    className="text-blue-600 hover:text-blue-800 mr-4 font-medium"
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() => openRecordModal(record)}
                                    className="text-yellow-600 hover:text-yellow-800 mr-4 font-medium"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteRecord(record.id)}
                                    className="text-red-600 hover:text-red-800 font-medium"
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
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* Transaction Modal */}
        {showTransactionModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-scaleIn">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {editingTransaction ? "Edit Transaction" : "Add Transaction"}
                    </h2>
                    {editingTransaction && (
                      <p className="text-sm text-blue-100 mt-1">
                        {editingTransaction.project?.title || "N/A"} - {editingTransaction.type} - ₱{parseFloat(editingTransaction.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={closeTransactionModal}
                    className="text-white hover:text-blue-200 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <form onSubmit={handleTransactionSubmit} className="p-8 space-y-6">
                {submitTransactionError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">Error</p>
                        <p className="text-sm text-red-700 mt-1 whitespace-pre-line">{submitTransactionError}</p>
                      </div>
                      <button
                        onClick={() => setSubmitTransactionError("")}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Project <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="project_id"
                      value={transactionForm.project_id}
                      onChange={handleTransactionChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={submittingTransaction}
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Transaction Date</label>
                    <input
                      type="date"
                      name="transaction_date"
                      value={transactionForm.transaction_date}
                      onChange={handleTransactionChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={submittingTransaction}
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty to use today's date</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                    <select
                      name="type"
                      value={transactionForm.type}
                      onChange={handleTransactionChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={submittingTransaction}
                    >
                      <option value="Expense">Expense</option>
                      <option value="Income">Income</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="amount"
                      placeholder="0.00"
                      value={transactionForm.amount}
                      onChange={handleTransactionChange}
                      step="0.01"
                      min="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={submittingTransaction}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Official</label>
                    <select
                      name="official_id"
                      value={transactionForm.official_id}
                      onChange={handleTransactionChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={submittingTransaction}
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <input
                      type="text"
                      name="description"
                      placeholder="Transaction description (optional)"
                      value={transactionForm.description}
                      onChange={handleTransactionChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={submittingTransaction}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeTransactionModal}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                    disabled={submittingTransaction}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-sm"
                    disabled={submittingTransaction}
                  >
                    {submittingTransaction ? "Saving..." : editingTransaction ? "Update Transaction" : "Add Transaction"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Document Upload Modal */}
        {selectedTransactionForDoc && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scaleIn">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Upload Document</h2>
                    <p className="text-sm text-blue-100 mt-1">
                      {selectedTransactionForDoc.project?.title || "N/A"} - ₱{parseFloat(selectedTransactionForDoc.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <button
                    onClick={closeDocumentUpload}
                    className="text-white hover:text-blue-200 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <form onSubmit={handleDocumentUpload} className="p-6 space-y-4">
                {documentUploadError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                    <p className="text-sm text-red-700 whitespace-pre-line">{documentUploadError}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Document Type/Title</label>
                  <input
                    type="text"
                    placeholder="e.g., receipt, invoice (optional)"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={uploadingDocument}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select File <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.docx"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0];
                      setDocumentFile(selectedFile || null);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                    disabled={uploadingDocument}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-sm"
                    disabled={uploadingDocument}
                  >
                    {uploadingDocument ? "Uploading..." : "Upload Document"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Financial Record Modal */}
        {showRecordModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-scaleIn">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">
                    {selectedRecord ? "Edit Financial Record" : "Add Financial Record"}
                  </h2>
                  <button
                    onClick={closeRecordModal}
                    className="text-white hover:text-blue-200 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <form onSubmit={handleRecordSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Year *</label>
                    <input
                      type="number"
                      name="year"
                      value={recordFormData.year}
                      onChange={handleRecordChange}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        selectedRecord ? 'bg-gray-50 cursor-not-allowed' : ''
                      }`}
                      required
                      disabled={submittingRecord || selectedRecord}
                      readOnly={!!selectedRecord}
                      title={selectedRecord ? "Year cannot be changed when editing" : ""}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Total Revenue *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="total_revenue"
                      value={recordFormData.total_revenue}
                      onChange={handleRecordChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={submittingRecord}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">IRA Allocation *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="ira_allocation"
                      value={recordFormData.ira_allocation}
                      onChange={handleRecordChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={submittingRecord}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Service Business Income</label>
                    <input
                      type="number"
                      step="0.01"
                      name="service_business_income"
                      value={recordFormData.service_business_income}
                      onChange={handleRecordChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={submittingRecord}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Local Tax Collections</label>
                    <input
                      type="number"
                      step="0.01"
                      name="local_tax_collections"
                      value={recordFormData.local_tax_collections}
                      onChange={handleRecordChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={submittingRecord}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Total Expenditures *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="total_expenditures"
                      value={recordFormData.total_expenditures}
                      onChange={handleRecordChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={submittingRecord}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Personnel Services</label>
                    <input
                      type="number"
                      step="0.01"
                      name="personnel_services"
                      value={recordFormData.personnel_services}
                      onChange={handleRecordChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={submittingRecord}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Maintenance & Operating Expenses</label>
                    <input
                      type="number"
                      step="0.01"
                      name="maintenance_operating_expenses"
                      value={recordFormData.maintenance_operating_expenses}
                      onChange={handleRecordChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={submittingRecord}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Capital Outlay</label>
                    <input
                      type="number"
                      step="0.01"
                      name="capital_outlay"
                      value={recordFormData.capital_outlay}
                      onChange={handleRecordChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={submittingRecord}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Fiscal Balance</label>
                    <input
                      type="number"
                      step="0.01"
                      name="fiscal_balance"
                      value={recordFormData.fiscal_balance}
                      onChange={handleRecordChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={submittingRecord}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Total Assets</label>
                    <input
                      type="number"
                      step="0.01"
                      name="total_assets"
                      value={recordFormData.total_assets}
                      onChange={handleRecordChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={submittingRecord}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Total Liabilities</label>
                    <input
                      type="number"
                      step="0.01"
                      name="total_liabilities"
                      value={recordFormData.total_liabilities}
                      onChange={handleRecordChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={submittingRecord}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Net Equity</label>
                    <input
                      type="number"
                      step="0.01"
                      name="net_equity"
                      value={recordFormData.net_equity}
                      onChange={handleRecordChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={submittingRecord}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeRecordModal}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                    disabled={submittingRecord}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-sm"
                    disabled={submittingRecord}
                  >
                    {submittingRecord ? "Saving..." : selectedRecord ? "Update" : "Create"}
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
    </div>
  );
}

