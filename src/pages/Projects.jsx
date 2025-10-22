import React, { useEffect, useState } from "react";
import API from "../services/api";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await API.get("/projects");
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-600">Loading projects...</div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Projects</h1>

      {projects.length === 0 ? (
        <p className="text-gray-600">No projects found.</p>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 border">#</th>
                <th className="px-4 py-2 border">Title</th>
                <th className="px-4 py-2 border">Barangay</th>
                <th className="px-4 py-2 border">Contractor</th>
                <th className="px-4 py-2 border">Budget</th>
                <th className="px-4 py-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, index) => (
                <tr key={project.id} className="text-gray-800 text-sm">
                  <td className="px-4 py-2 border">{index + 1}</td>
                  <td className="px-4 py-2 border">{project.title}</td>
                  <td className="px-4 py-2 border">
                    {project.barangay?.name || "N/A"}
                  </td>
                  <td className="px-4 py-2 border">
                    {project.contractor?.name || "N/A"}
                  </td>
                  <td className="px-4 py-2 border">
                    ₱
                    {parseFloat(project.budget_allocated || 0).toLocaleString()}
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
