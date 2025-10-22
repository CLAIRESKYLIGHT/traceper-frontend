import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";

export default function DashboardLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-700 text-white flex flex-col p-5">
        <h2 className="text-2xl font-bold mb-8">TracePer</h2>
        <nav className="flex flex-col gap-4">
          <a href="/dashboard" className="hover:bg-blue-600 p-2 rounded">
            📊 Dashboard
          </a>
          <a href="/projects" className="hover:bg-blue-600 p-2 rounded">
            🏗️ Projects
          </a>
          <a href="/barangays" className="hover:bg-blue-600 p-2 rounded">
            🏠 Barangays
          </a>
          <a href="/officials" className="hover:bg-blue-600 p-2 rounded">
            👥 Officials
          </a>
          <a href="/contractors" className="hover:bg-blue-600 p-2 rounded">
            ⚙️ Contractors
          </a>
        </nav>
        <button
          onClick={handleLogout}
          className="mt-auto bg-red-600 hover:bg-red-700 p-2 rounded text-white"
        >
          🚪 Logout
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-700">Dashboard</h1>
          <span className="text-sm text-gray-500">
            Welcome, {localStorage.getItem("user_name") || "User"}
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
