import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

export default function BarangayDetails() {
  const { id } = useParams();
  const [barangay, setBarangay] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await API.get(`/barangays/${id}`);
        setBarangay(res.data);
      } catch (err) {
        console.error("Error fetching barangay details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <p className="p-6">Loading barangay details...</p>;
  if (!barangay) return <p className="p-6 text-red-500">Barangay not found.</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-4">{barangay.name}</h1>

      <div className="bg-white p-6 shadow rounded-lg mb-6">
        <p>
          <strong>Population:</strong> {barangay.population}
        </p>
        <p>
          <strong>Status:</strong> {barangay.status}
        </p>
      </div>

      <div className="bg-white p-6 shadow rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Ongoing Projects</h2>
        {barangay.projects?.length > 0 ? (
          <ul className="list-disc pl-5">
            {barangay.projects.map((p) => (
              <li key={p.id}>{p.title}</li>
            ))}
          </ul>
        ) : (
          <p>No ongoing projects.</p>
        )}
      </div>

      <div className="bg-white p-6 shadow rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Officials</h2>
        {barangay.officials?.length > 0 ? (
          <ul className="list-disc pl-5">
            {barangay.officials.map((o) => (
              <li key={o.id}>
                {o.name} — {o.position}
              </li>
            ))}
          </ul>
        ) : (
          <p>No officials found.</p>
        )}
      </div>
    </div>
  );
}
