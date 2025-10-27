import React, { useEffect, useState } from "react";
import API from "../services/api";

const Barangays = () => {
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBarangays = async () => {
      try {
        const response = await API.get("/barangays");
        console.log("✅ Barangays fetched:", response.data);
        setBarangays(response.data);
      } catch (err) {
        console.error("❌ Error fetching barangays:", err);
        setError("Failed to load barangays. Please check API or token.");
      } finally {
        setLoading(false);
      }
    };

    fetchBarangays();
  }, []);

  if (loading)
    return (
      <p className="p-6 text-center text-gray-600">Loading barangays...</p>
    );
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">🏘️ Barangays</h1>

      {barangays.length === 0 ? (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg text-center">
          No barangays found.
        </div>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-blue-600 text-white text-left">
                <th className="px-4 py-3 border">ID</th>
                <th className="px-4 py-3 border">Name</th>
                <th className="px-4 py-3 border">Captain</th>
                <th className="px-4 py-3 border">Population</th>
              </tr>
            </thead>
            <tbody>
              {barangays.map((b) => (
                <tr
                  key={b.id}
                  className="hover:bg-blue-50 transition duration-150 border-t"
                >
                  <td className="px-4 py-2 border">{b.id}</td>
                  <td className="px-4 py-2 border">{b.name}</td>
                  <td className="px-4 py-2 border">
                    {b.captain || "Not Assigned"}
                  </td>
                  <td className="px-4 py-2 border">{b.population || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Barangays;
