import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

export default function Barangays() {
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBarangays = async () => {
      try {
        console.log("📡 Fetching barangays...");
        const response = await API.get("/barangays", {
          headers: { "Cache-Control": "no-cache" },
        });
        console.log("✅ Barangays fetched:", response.data);
        setBarangays(response.data || []);
      } catch (err) {
        console.error("❌ Error fetching barangays:", err);
        setError("Failed to load barangays.");
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
      <h1 className="text-3xl font-bold mb-4">🏠 Barangays</h1>

      {barangays.length === 0 ? (
        <p>No barangays found.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {barangays.map((b) => (
            <Link
              key={b.id}
              to={`/barangays/${b.id}`}
              className="p-4 bg-white shadow rounded-lg hover:shadow-md transition"
            >
              <h2 className="text-xl font-semibold">{b.name}</h2>
              <p className="text-gray-600 text-sm">
                Population: {b.population || "N/A"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
