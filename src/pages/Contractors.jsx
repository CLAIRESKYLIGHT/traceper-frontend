import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function Contractors() {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingContractor, setEditingContractor] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    company_name: "",
    contact_number: "",
    address: "",
  });

  // ✅ Fetch all contractors
  const fetchContractors = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/contractors");
      setContractors(data);
    } catch (err) {
      console.error("Error fetching contractors:", err);
      setError("Failed to load contractors.");
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
        company_name: "",
        contact_number: "",
        address: "",
      }
    );
    setShowModal(true);
  };

  // ✅ Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingContractor(null);
  };

  // ✅ Add or update contractor
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingContractor) {
        await API.put(`/contractors/${editingContractor.id}`, formData);
      } else {
        await API.post("/contractors", formData);
      }
      fetchContractors();
      closeModal();
    } catch (err) {
      console.error("Error saving contractor:", err);
      alert("Failed to save contractor.");
    }
  };

  // ✅ Delete contractor
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this contractor?")) {
      try {
        await API.delete(`/contractors/${id}`);
        fetchContractors();
      } catch (err) {
        console.error("Error deleting contractor:", err);
        alert("Failed to delete contractor.");
      }
    }
  };

  if (loading)
    return (
      <p className="p-6 text-center text-gray-600">Loading contractors...</p>
    );
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">⚙️ Contractors</h1>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          + Add Contractor
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left border">Name</th>
              <th className="px-4 py-3 text-left border">Company</th>
              <th className="px-4 py-3 text-left border">Contact</th>
              <th className="px-4 py-3 text-left border">Address</th>
              <th className="px-4 py-3 text-center border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contractors.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center text-gray-500 py-4 border-t"
                >
                  No contractors found.
                </td>
              </tr>
            ) : (
              contractors.map((contractor) => (
                <tr key={contractor.id} className="border-t hover:bg-blue-50">
                  <td className="px-4 py-2 border">{contractor.name}</td>
                  <td className="px-4 py-2 border">
                    {contractor.company_name}
                  </td>
                  <td className="px-4 py-2 border">
                    {contractor.contact_number}
                  </td>
                  <td className="px-4 py-2 border">{contractor.address}</td>
                  <td className="px-4 py-2 border text-center">
                    <button
                      onClick={() => openModal(contractor)}
                      className="px-3 py-1 bg-yellow-400 text-blue-800 rounded-lg mr-2 hover:bg-yellow-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(contractor.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingContractor ? "Edit Contractor" : "Add New Contractor"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                name="company_name"
                placeholder="Company Name"
                value={formData.company_name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                name="contact_number"
                placeholder="Contact Number"
                value={formData.contact_number}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
