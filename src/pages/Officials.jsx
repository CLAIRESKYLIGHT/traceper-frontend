import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function Officials() {
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
      const { data } = await API.get("/officials");
      setOfficials(data);
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

  if (loading)
    return (
      <p className="p-6 text-center text-gray-600">Loading officials...</p>
    );
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          👥 Barangay Officials
        </h1>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          + Add Official
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left border">Name</th>
              <th className="px-4 py-3 text-left border">Position</th>
              <th className="px-4 py-3 text-left border">Contact</th>
              <th className="px-4 py-3 text-left border">Barangay</th>
              <th className="px-4 py-3 text-center border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {officials.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center text-gray-500 py-4 border-t"
                >
                  No officials found.
                </td>
              </tr>
            ) : (
              officials.map((official) => (
                <tr key={official.id} className="border-t hover:bg-blue-50">
                  <td className="px-4 py-2 border">{official.name}</td>
                  <td className="px-4 py-2 border">{official.position}</td>
                  <td className="px-4 py-2 border">{official.contact}</td>
                  <td className="px-4 py-2 border">
                    {official.barangay?.name || "N/A"}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    <button
                      onClick={() => openModal(official)}
                      className="px-3 py-1 bg-yellow-400 text-blue-800 rounded-lg mr-2 hover:bg-yellow-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(official.id)}
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
              {editingOfficial ? "Edit Official" : "Add New Official"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                name="position"
                placeholder="Position"
                value={formData.position}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                name="contact"
                placeholder="Contact"
                value={formData.contact}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                name="barangay_id"
                placeholder="Barangay ID"
                value={formData.barangay_id}
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
