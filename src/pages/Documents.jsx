import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  // ✅ Fetch all documents
  const fetchDocuments = async () => {
    try {
      const { data } = await API.get("/documents");
      setDocuments(data);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // ✅ Handle upload
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file || !title) {
      alert("Please provide a title and select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    try {
      setUploading(true);
      await API.post("/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTitle("");
      setFile(null);
      fetchDocuments();
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload document.");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await API.delete(`/documents/${id}`);
        fetchDocuments();
      } catch (err) {
        console.error("Error deleting document:", err);
        alert("Failed to delete document.");
      }
    }
  };

  if (loading)
    return (
      <p className="p-6 text-center text-gray-600">Loading documents...</p>
    );
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📄 Documents</h1>
      </div>

      {/* Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Upload New Document</h2>
        <form
          onSubmit={handleUpload}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <input
            type="text"
            placeholder="Document Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-3 rounded-lg flex-1 w-full"
            required
          />
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.docx"
            onChange={(e) => setFile(e.target.files[0])}
            className="border p-2 rounded-lg w-full sm:w-auto"
            required
          />
          <button
            type="submit"
            disabled={uploading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </form>
      </div>

      {/* Documents Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left border">Title</th>
              <th className="px-4 py-3 text-left border">File</th>
              <th className="px-4 py-3 text-left border">Uploaded At</th>
              <th className="px-4 py-3 text-center border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="text-center text-gray-500 py-4 border-t"
                >
                  No documents found.
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id} className="border-t hover:bg-blue-50">
                  <td className="px-4 py-2 border">{doc.title}</td>
                  <td className="px-4 py-2 border text-blue-700 underline">
                    <a
                      href={`http://127.0.0.1:8000/storage/${doc.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View File
                    </a>
                  </td>
                  <td className="px-4 py-2 border">
                    {new Date(doc.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    <button
                      onClick={() => handleDelete(doc.id)}
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
    </div>
  );
}
