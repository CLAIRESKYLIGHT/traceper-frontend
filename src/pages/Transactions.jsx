import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    project_id: "",
    type: "Expense",
    amount: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Fetch all transactions
  const fetchTransactions = async () => {
    try {
      const { data } = await API.get("/transactions");
      setTransactions(data);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch projects for dropdown
  const fetchProjects = async () => {
    try {
      const { data } = await API.get("/projects");
      setProjects(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchProjects();
  }, []);

  // ✅ Handle form changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Add transaction (admin only)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/transactions", form);
      setForm({ project_id: "", type: "Expense", amount: "", description: "" });
      fetchTransactions();
    } catch (err) {
      console.error("Error adding transaction:", err);
      alert("Failed to add transaction.");
    }
  };

  // ✅ Delete transaction
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await API.delete(`/transactions/${id}`);
        fetchTransactions();
      } catch (err) {
        console.error("Error deleting transaction:", err);
      }
    }
  };

  if (loading)
    return (
      <p className="p-6 text-center text-gray-600">Loading transactions...</p>
    );
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">💰 Transactions</h1>

      {/* Add Transaction Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New Transaction</h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <select
            name="project_id"
            value={form.project_id}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            required
          >
            <option value="">Select Project</option>
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.title}
              </option>
            ))}
          </select>

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          >
            <option value="Expense">Expense</option>
            <option value="Income">Income</option>
          </select>

          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            required
          />

          <input
            type="text"
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="border p-3 rounded-lg col-span-2 md:col-span-1"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Add
          </button>
        </form>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left border">Project</th>
              <th className="px-4 py-3 text-left border">Type</th>
              <th className="px-4 py-3 text-left border">Amount</th>
              <th className="px-4 py-3 text-left border">Description</th>
              <th className="px-4 py-3 text-left border">Date</th>
              <th className="px-4 py-3 text-center border">Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 py-4">
                  No transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="border-t hover:bg-blue-50">
                  <td className="px-4 py-2 border">
                    {tx.project?.title || "N/A"}
                  </td>
                  <td
                    className={`px-4 py-2 border font-medium ${
                      tx.type === "Income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {tx.type}
                  </td>
                  <td className="px-4 py-2 border">₱{tx.amount}</td>
                  <td className="px-4 py-2 border">{tx.description}</td>
                  <td className="px-4 py-2 border">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
