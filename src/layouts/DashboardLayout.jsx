import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import API from "../services/api";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const navigationItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/projects", label: "Projects", icon: "🏗️" },
    { path: "/barangays", label: "Barangays", icon: "🏠" },
  ];

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-blue-600 text-white shadow-lg"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-gradient-to-b from-blue-600 to-blue-700 text-white
          transform transition-transform duration-300 ease-in-out
          flex flex-col p-6 shadow-2xl
          ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 pt-4">
          <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-blue-700 font-bold text-lg">T</span>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
            TracePer
          </h2>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 flex-1">
          {navigationItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setIsMobileMenuOpen(false);
              }}
              className={`
                flex items-center gap-3 p-3 rounded-xl transition-all duration-200
                hover:bg-blue-500 hover:shadow-md hover:scale-105
                ${
                  isActiveRoute(item.path)
                    ? "bg-yellow-400 text-blue-700 shadow-lg font-semibold"
                    : "text-white"
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-blue-500 pt-4 mt-4">
          <div className="flex items-center gap-3 mb-4 p-2">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">
              {localStorage.getItem("user_name")?.charAt(0) || "U"}
            </div>
            <span className="text-sm text-blue-100">
              {localStorage.getItem("user_name") || "User"}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all duration-200 hover:shadow-lg hover:scale-105"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-800">
              {navigationItems.find((item) => item.path === location.pathname)
                ?.label || "Dashboard"}
            </h1>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-full">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">
                  {localStorage.getItem("user_name")?.charAt(0) || "U"}
                </div>
                <span className="text-sm text-blue-700 font-medium">
                  Welcome, {localStorage.getItem("user_name") || "User"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto bg-gradient-to-br from-blue-50 to-white">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
