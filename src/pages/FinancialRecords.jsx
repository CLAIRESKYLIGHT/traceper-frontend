import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../utils/useAuth";

export default function FinancialRecords() {
  const { isAdmin } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
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
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await API.get("/financial-records");
      const recordsData = response.data?.data || response.data || [];
      setRecords(Array.isArray(recordsData) ? recordsData : []);
    } catch (err) {
      console.error("Error fetching financial records:", err);
      setError("Failed to load financial records.");
    } finally {
      setLoading(false);
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

  const handleYearChange = (year) => {
    setSelectedYear(year);
    if (year) {
      fetchRecordByYear(year);
    } else {
      setSelectedRecord(null);
    }
  };

  const openModal = (record = null) => {
    if (record) {
      setFormData({
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
      setFormData({
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
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const submitData = {
      year: parseInt(formData.year),
      total_revenue: parseFloat(formData.total_revenue) || 0,
      ira_allocation: parseFloat(formData.ira_allocation) || 0,
      service_business_income: parseFloat(formData.service_business_income) || 0,
      local_tax_collections: parseFloat(formData.local_tax_collections) || 0,
      total_expenditures: parseFloat(formData.total_expenditures) || 0,
      personnel_services: parseFloat(formData.personnel_services) || 0,
      maintenance_operating_expenses: parseFloat(formData.maintenance_operating_expenses) || 0,
      capital_outlay: parseFloat(formData.capital_outlay) || 0,
      fiscal_balance: parseFloat(formData.fiscal_balance) || 0,
      total_assets: parseFloat(formData.total_assets) || 0,
      total_liabilities: parseFloat(formData.total_liabilities) || 0,
      net_equity: parseFloat(formData.net_equity) || 0,
    };

    try {
      if (selectedRecord) {
        await API.put(`/financial-records/${selectedRecord.id}`, submitData);
      } else {
        await API.post("/financial-records", submitData);
      }
      await fetchRecords();
      closeModal();
      alert("Financial record saved successfully!");
    } catch (err) {
      console.error("Error saving financial record:", err);
      alert("Failed to save financial record.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this financial record?")) {
      try {
        await API.delete(`/financial-records/${id}`);
        await fetchRecords();
        alert("Financial record deleted successfully!");
      } catch (err) {
        console.error("Error deleting financial record:", err);
        alert("Failed to delete financial record.");
      }
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border-l-4 border-blue-600 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Records</h1>
            <p className="text-sm text-gray-600 mt-1">Annual municipal financial data</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => openModal()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Financial Record
            </button>
          )}
        </div>
      </div>

      {/* Year Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">View Record by Year:</label>
          <select
            value={selectedYear || ""}
            onChange={(e) => handleYearChange(e.target.value ? parseInt(e.target.value) : null)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

      {/* Selected Record Details */}
      {selectedRecord && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Financial Record - {selectedRecord.year}</h2>
            {isAdmin && (
              <div className="flex gap-2">
                <button
                  onClick={() => openModal(selectedRecord)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(selectedRecord.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ₱{(selectedRecord.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Expenditures</p>
              <p className="text-2xl font-bold text-gray-900">
                ₱{(selectedRecord.total_expenditures || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Fiscal Balance</p>
              <p className={`text-2xl font-bold ${selectedRecord.fiscal_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₱{(selectedRecord.fiscal_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">IRA Allocation</p>
              <p className="text-xl font-bold text-gray-900">
                ₱{(selectedRecord.ira_allocation || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Assets</p>
              <p className="text-xl font-bold text-gray-900">
                ₱{(selectedRecord.total_assets || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Net Equity</p>
              <p className="text-xl font-bold text-gray-900">
                ₱{(selectedRecord.net_equity || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Records List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">All Financial Records</h2>
        {records.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No financial records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expenditures</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleYearChange(record.year)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        View
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => openModal(record)}
                            className="text-yellow-600 hover:text-yellow-800 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedRecord ? "Edit Financial Record" : "Add Financial Record"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Revenue *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="total_revenue"
                    value={formData.total_revenue}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">IRA Allocation *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="ira_allocation"
                    value={formData.ira_allocation}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Business Income</label>
                  <input
                    type="number"
                    step="0.01"
                    name="service_business_income"
                    value={formData.service_business_income}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Local Tax Collections</label>
                  <input
                    type="number"
                    step="0.01"
                    name="local_tax_collections"
                    value={formData.local_tax_collections}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Expenditures *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="total_expenditures"
                    value={formData.total_expenditures}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Personnel Services</label>
                  <input
                    type="number"
                    step="0.01"
                    name="personnel_services"
                    value={formData.personnel_services}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance & Operating Expenses</label>
                  <input
                    type="number"
                    step="0.01"
                    name="maintenance_operating_expenses"
                    value={formData.maintenance_operating_expenses}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capital Outlay</label>
                  <input
                    type="number"
                    step="0.01"
                    name="capital_outlay"
                    value={formData.capital_outlay}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fiscal Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    name="fiscal_balance"
                    value={formData.fiscal_balance}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Assets</label>
                  <input
                    type="number"
                    step="0.01"
                    name="total_assets"
                    value={formData.total_assets}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Liabilities</label>
                  <input
                    type="number"
                    step="0.01"
                    name="total_liabilities"
                    value={formData.total_liabilities}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Net Equity</label>
                  <input
                    type="number"
                    step="0.01"
                    name="net_equity"
                    value={formData.net_equity}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={submitting}
                  />
                </div>
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
                  {submitting ? "Saving..." : selectedRecord ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

