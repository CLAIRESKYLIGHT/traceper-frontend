import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../utils/useAuth";
import GlobalSearch from "./GlobalSearch";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, userName, userRole } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const logout = async () => {
    try {
      await API.post("/logout");
    } catch (err) {
      console.warn("Logout API failed or not needed:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user_name");
      localStorage.removeItem("user_role");
      window.dispatchEvent(new Event("storage"));
      navigate("/");
    }
  };

  const navItems = [
    { 
      name: "Dashboard", 
      path: isAdmin ? "/admin/dashboard" : "/citizen/dashboard",
    },
    { 
      name: "Projects", 
      path: "/projects",
    },
    { 
      name: "Barangays", 
      path: "/barangays",
    },
    { 
      name: "Map", 
      path: "/map",
    },
    { 
      name: "Officials", 
      path: "/officials",
    },
    { 
      name: "Documents", 
      path: "/documents",
    },
    { 
      name: "Financials", 
      path: "/financials",
    },
    { 
      name: "IRA Shares", 
      path: "/barangay-ira-shares",
    },
    { 
      name: "Contractors", 
      path: "/contractors",
    },
  ];

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-teal-200 sticky top-0 z-50 shadow-lg shadow-teal-100/50">
      <div className="max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center h-16 gap-2 lg:gap-3">
          {/* Logo */}
          <Link to={isAdmin ? "/admin/dashboard" : "/citizen/dashboard"} className="flex items-center gap-2 group flex-shrink-0">
            <div className="relative w-10 h-10 bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30 group-hover:shadow-xl group-hover:shadow-teal-500/40 transition-all duration-300 group-hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-accent/20 to-transparent rounded-xl"></div>
              <svg className="w-5 h-5 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="hidden md:block">
              <h1 className="text-sm font-bold bg-gradient-to-r from-teal-700 to-teal-800 bg-clip-text text-transparent tracking-tight leading-tight whitespace-nowrap">
                Matnog Portal
              </h1>
            </div>
          </Link>

          {/* Global Search - Desktop */}
          <div className="hidden lg:block flex-1 min-w-0 max-w-md mx-1">
            <GlobalSearch />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 flex-shrink-0 min-w-0">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  relative px-3 py-1.5 rounded-lg font-medium text-xs transition-all duration-200
                  whitespace-nowrap flex-shrink-0 flex items-center justify-center
                  ${
                    isActiveRoute(item.path)
                      ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md shadow-teal-500/30"
                      : "text-gray-700 hover:bg-teal-50 hover:text-teal-700"
                  }
                `}
                aria-current={isActiveRoute(item.path) ? "page" : undefined}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
            {/* User Info */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-1.5 px-1.5 py-1 rounded-lg hover:bg-gray-50 transition-colors group"
                aria-label="User menu"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 rounded-lg flex items-center justify-center text-white font-semibold text-xs shadow-md shadow-teal-500/30">
                  {userName?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-gray-900 leading-tight truncate max-w-[100px]">{userName || "User"}</p>
                  <p className="text-[10px] text-gray-500 leading-tight">{isAdmin ? "Admin" : "Citizen"}</p>
                </div>
                <svg className="w-3.5 h-3.5 text-gray-400 hidden lg:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-teal-100 py-2 z-20 backdrop-blur-sm">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{userName || "User"}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{isAdmin ? "Administrator" : "Citizen"}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors flex items-center gap-3"
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 rounded-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            {/* Global Search - Mobile */}
            <div className="px-4 mb-4">
              <GlobalSearch />
            </div>
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`
                    flex items-center justify-center px-4 py-3 rounded-lg font-semibold text-sm transition-colors
                    ${
                      isActiveRoute(item.path)
                        ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md"
                        : "text-gray-700 hover:bg-teal-50 hover:text-teal-700"
                    }
                  `}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

