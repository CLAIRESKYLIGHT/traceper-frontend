import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const logout = async () => {
    try {
      await API.post("/logout"); // optional if your backend supports it
    } catch (err) {
      console.warn("Logout API failed or not needed:", err);
    } finally {
      // Remove stored auth data
      localStorage.removeItem("token");
      localStorage.removeItem("user_name");

      // Notify App.jsx that token changed
      window.dispatchEvent(new Event("storage"));

      // ✅ Redirect to the welcome page
      navigate("/");
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/", icon: "📊" },
    { name: "Projects", path: "/projects", icon: "🏗️" },
    { name: "Barangays", path: "/barangays", icon: "🏠" },
    { name: "Officials", path: "/officials", icon: "👥" },
    { name: "Contractors", path: "/contractors", icon: "⚙️" },
  ];

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <div
      className={`
      bg-gradient-to-b from-blue-600 to-blue-700 text-white
      min-h-screen flex flex-col justify-between shadow-2xl
      transition-all duration-300 ease-in-out
      ${isCollapsed ? "w-20" : "w-64"}
    `}
    >
      {/* Sidebar header */}
      <div>
        <div className="p-6 border-b border-blue-500 relative">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-blue-700 font-bold text-lg">T</span>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
                  TracePer
                </h2>
              </div>
            )}
            {isCollapsed && (
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg mx-auto">
                <span className="text-blue-700 font-bold text-lg">T</span>
              </div>
            )}
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-1/2 transform -translate-y-1/2 
                       w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center 
                       shadow-lg hover:scale-110 transition-transform duration-200"
          >
            <span
              className={`text-blue-700 text-sm font-bold transform transition-transform duration-300 ${
                isCollapsed ? "rotate-180" : ""
              }`}
            >
              ‹
            </span>
          </button>
        </div>

        {/* Navigation links */}
        <nav className="mt-6 space-y-2 px-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 p-3 rounded-xl transition-all duration-200
                hover:bg-blue-500 hover:shadow-md hover:scale-105 group
                ${
                  isActiveRoute(item.path)
                    ? "bg-yellow-400 text-blue-700 shadow-lg font-semibold"
                    : "text-white"
                }
              `}
              title={isCollapsed ? item.name : ""}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {!isCollapsed && (
                <span className="text-sm font-medium whitespace-nowrap">
                  {item.name}
                </span>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* User info and logout */}
      <div className="p-4 border-t border-blue-500">
        {/* User info */}
        {!isCollapsed && (
          <div className="flex items-center gap-3 mb-4 p-2 rounded-lg bg-blue-500 bg-opacity-50">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm shadow">
              {localStorage.getItem("user_name")?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {localStorage.getItem("user_name") || "User"}
              </p>
              <p className="text-xs text-blue-200 truncate">Administrator</p>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="flex justify-center mb-4">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm shadow">
              {localStorage.getItem("user_name")?.charAt(0) || "U"}
            </div>
          </div>
        )}

        {/* Logout button */}
        <button
          onClick={logout}
          className={`
            w-full flex items-center gap-3 p-3 rounded-xl 
            bg-red-500 hover:bg-red-600 text-white 
            transition-all duration-200 hover:shadow-lg hover:scale-105
            ${isCollapsed ? "justify-center" : ""}
          `}
          title={isCollapsed ? "Logout" : ""}
        >
          <span>🚪</span>
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}

          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
              Logout
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
