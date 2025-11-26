import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../utils/useAuth";

const Sidebar = ({ isOpen = false, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isAdmin, userName, userRole } = useAuth();

  const logout = async () => {
    try {
      await API.post("/logout"); // optional if your backend supports it
    } catch (err) {
      console.warn("Logout API failed or not needed:", err);
    } finally {
      // Remove stored auth data
      localStorage.removeItem("token");
      localStorage.removeItem("user_name");
      localStorage.removeItem("user_role");

      // Notify App.jsx that token changed
      window.dispatchEvent(new Event("storage"));

      // ✅ Redirect to the welcome page
      navigate("/");
    }
  };

  // Navigation items with SVG icons
  const navItems = [
    { 
      name: "Dashboard", 
      path: isAdmin ? "/admin/dashboard" : "/citizen/dashboard", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      name: "Projects", 
      path: "/projects", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    { 
      name: "Barangays", 
      path: "/barangays", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      name: "Map", 
      path: "/map", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      )
    },
    { 
      name: "Officials", 
      path: "/officials", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    { 
      name: "Documents", 
      path: "/documents", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      name: "Transactions", 
      path: "/transactions", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    // Only show Contractors for admin
    ...(isAdmin ? [{ 
      name: "Contractors", 
      path: "/contractors", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    }] : []),
  ];

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40
          bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 text-white
          min-h-screen flex flex-col justify-between shadow-2xl border-r border-blue-500/30
          transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${isCollapsed && isOpen ? "w-20" : "w-64"}
        `}
      >
      {/* Sidebar header */}
      <div className="flex-1 flex flex-col">
        <div className="p-6 border-b border-white/10 relative">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-yellow-300/50">
                  <span className="text-blue-900 font-bold text-xl">T</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">TracePer</h2>
                  <p className="text-xs text-blue-200">Transparency Portal</p>
                </div>
              </div>
            )}
            {isCollapsed && (
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-yellow-300/50 mx-auto">
                <span className="text-blue-900 font-bold text-xl">T</span>
              </div>
            )}
          </div>

          {/* Toggle Button - Only show when sidebar is open */}
          {isOpen && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="absolute -right-3 top-1/2 transform -translate-y-1/2 
                         w-7 h-7 bg-white rounded-full flex items-center justify-center 
                         shadow-lg hover:scale-110 transition-all duration-200 hover:shadow-xl
                         border-2 border-blue-300 z-10"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg
                className={`w-4 h-4 text-blue-700 transform transition-transform duration-300 ${
                  isCollapsed ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Close Button for Mobile */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 lg:hidden w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
            title="Close sidebar"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation links */}
        <nav className="mt-4 space-y-1 px-3 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = isActiveRoute(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  group
                  ${
                    isActive
                      ? "bg-white text-blue-700 shadow-lg font-semibold"
                      : "text-blue-100 hover:bg-white/10 hover:text-white"
                  }
                `}
                title={isCollapsed ? item.name : ""}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-r-full"></div>
                )}
                
                <span className={`flex-shrink-0 ${isActive ? "text-blue-700" : "text-blue-200"}`}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {item.name}
                  </span>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 shadow-xl pointer-events-none">
                    {item.name}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-full w-0 h-0 border-t-4 border-t-transparent border-r-4 border-r-gray-900 border-b-4 border-b-transparent"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User info and logout */}
      <div className="p-4 border-t border-white/10 space-y-3">
        {/* User info */}
        {!isCollapsed && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-blue-900 font-bold text-sm shadow-lg ring-2 ring-yellow-300/50">
              {localStorage.getItem("user_name")?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {userName || "User"}
              </p>
              <p className="text-xs text-blue-200 truncate flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${isAdmin ? "bg-green-400" : "bg-blue-300"}`}></span>
                {isAdmin ? "Administrator" : "Citizen"}
              </p>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="flex justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-blue-900 font-bold text-sm shadow-lg ring-2 ring-yellow-300/50">
              {localStorage.getItem("user_name")?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        )}

        {/* Logout button */}
        <button
          onClick={logout}
          className={`
            group relative w-full flex items-center gap-3 px-4 py-3 rounded-lg 
            bg-red-500/90 hover:bg-red-600 text-white 
            transition-all duration-200 hover:shadow-lg hover:scale-[1.02]
            font-medium
            ${isCollapsed ? "justify-center" : ""}
          `}
          title={isCollapsed ? "Logout" : ""}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!isCollapsed && <span className="text-sm">Logout</span>}

          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 shadow-xl pointer-events-none">
              Logout
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-full w-0 h-0 border-t-4 border-t-transparent border-r-4 border-r-gray-900 border-b-4 border-b-transparent"></div>
            </div>
          )}
        </button>
      </div>
      </div>
    </>
  );
};

export default Sidebar;
