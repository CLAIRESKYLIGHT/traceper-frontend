import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import CitizenDashboard from "./pages/CitizenDashboard";
import Projects from "./pages/Projects";
import Barangays from "./pages/Barangays";
import BarangayDetails from "./pages/BarangayDetails";
import Officials from "./pages/Officials";
import Contractors from "./pages/Contractors";
import Documents from "./pages/Documents";
import Navbar from "./components/Navbar";
import Financials from "./pages/Financials";
import Profile from "./pages/Profile";
import BarangayIRAShares from "./pages/BarangayIRAShares";
import { getUserRole } from "./utils/useAuth";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userRole, setUserRole] = useState(localStorage.getItem("user_role"));

  // 🔄 Watch for login/logout updates
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
      setUserRole(localStorage.getItem("user_role"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ✅ React to token updates after login
  useEffect(() => {
    setToken(localStorage.getItem("token"));
    setUserRole(localStorage.getItem("user_role"));
  }, []);

  // Get user role for routing
  const role = getUserRole();
  const isAdmin = role === "admin";

  return (
    <Router>
      <Routes>
        {!token ? (
          <>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : (
          <Route
            path="/*"
            element={
              <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
                <Navbar />
                <div className="w-full">
                  <Routes>
                    {/* Redirect root to appropriate dashboard */}
                    <Route
                      path="/"
                      element={
                        <Navigate
                          to={isAdmin ? "/admin/dashboard" : "/citizen/dashboard"}
                        />
                      }
                    />
                    {/* Admin Dashboard */}
                    <Route
                      path="/admin/dashboard"
                      element={<AdminDashboard />}
                    />
                    {/* Citizen Dashboard */}
                    <Route
                      path="/citizen/dashboard"
                      element={<CitizenDashboard />}
                    />
                    {/* Shared routes - accessible by both */}
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/barangays" element={<Barangays />} />
                    <Route
                      path="/barangays/:id"
                      element={<BarangayDetails />}
                    />
                    <Route path="/officials" element={<Officials />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/financials" element={<Financials />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/barangay-ira-shares" element={<BarangayIRAShares />} />
                    <Route path="/contractors" element={<Contractors />} />
                    {/* Admin-only routes */}
                    {/* Fallback redirect */}
                    <Route
                      path="*"
                      element={
                        <Navigate
                          to={isAdmin ? "/admin/dashboard" : "/citizen/dashboard"}
                        />
                      }
                    />
                  </Routes>
                </div>
              </div>
            }
          />
        )}
      </Routes>
    </Router>
  );
}

export default App;
