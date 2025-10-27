import React, { useEffect, useState } from "react";
import API from "../services/api";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await API.get("/projects");
        console.log("✅ Projects fetched:", data);
        setProjects(data);
      } catch (err) {
        console.error("❌ Error fetching projects:", err);
        setError("Failed to load projects.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) return <p className="p-6 text-center">Loading projects...</p>;
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">🏗️ Projects</h1>

      {projects.length === 0 ? (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg text-center">
          No projects found.
        </div>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-blue-600 text-white text-left">
                <th className="px-4 py-3 border">Title</th>
                <th className="px-4 py-3 border">Barangay</th>
                <th className="px-4 py-3 border">Contractor</th>
                <th className="px-4 py-3 border">Status</th>
                <th className="px-4 py-3 border">Budget</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="hover:bg-blue-50 transition duration-150 border-t"
                >
                  <td className="px-4 py-2 border">{project.title}</td>
                  <td className="px-4 py-2 border">
                    {project.barangay?.name || "N/A"}
                  </td>
                  <td className="px-4 py-2 border">
                    {project.contractor?.name || "N/A"}
                  </td>
                  <td className="px-4 py-2 border">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        project.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : project.status === "ongoing"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {project.status || "Unknown"}
                    </span>
                  </td>
                  <td className="px-4 py-2 border">
                    ₱{project.budget_allocated?.toLocaleString() || 0}
                  </td>
                  <td className="px-4 py-2 border">{project.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Projects;
