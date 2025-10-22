import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await API.post("/logout");
      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "Projects", path: "/projects" },
    { name: "Barangays", path: "/barangays" },
    { name: "Officials", path: "/officials" },
    { name: "Documents", path: "/documents" },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col justify-between shadow-lg">
      {/* Sidebar header */}
      <div>
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-center">TracePer</h2>
        </div>

        {/* Navigation links */}
        <nav className="mt-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-6 py-3 text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Logout button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="w-full bg-red-600 hover:bg-red-700 py-2 px-4 rounded text-sm font-medium"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
