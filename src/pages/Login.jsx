import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Attempting login with:", { email, password: "***" });
      const res = await API.post("/login", { email, password });
      console.log("Login response:", res.data);
      
      if (!res.data.token) {
        setError("Login failed: No token received from server");
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user_name", res.data.user?.name || res.data.name || "User");
      // Store user role (assuming API returns role as 'admin' or 'citizen')
      const role = res.data.user?.role || res.data.role || "citizen";
      localStorage.setItem("user_role", role);

      // 🔥 Trigger re-render in App.jsx
      window.dispatchEvent(new Event("storage"));

      // Redirect based on role
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/citizen/dashboard");
      }
    } catch (err) {
      console.error("Login error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
      });

      // More detailed error handling
      if (err.response) {
        // Server responded with error
        const errorData = err.response.data;
        const errorMessage = 
          errorData?.message || 
          errorData?.error || 
          errorData?.errors?.email?.[0] ||
          errorData?.errors?.password?.[0] ||
          `Server error: ${err.response.status} ${err.response.statusText}`;
        setError(errorMessage);
      } else if (err.request) {
        // Request was made but no response received
        setError("Cannot connect to server. Please check your internet connection and try again.");
      } else {
        // Something else happened
        setError(err.message || "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-teal-900 via-teal-700 via-teal-600 to-teal-500 relative overflow-hidden">
      {/* Floating Gradients */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-accent/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-teal/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-300/10 rounded-full blur-3xl"></div>

      {/* Centered Card */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 lg:px-16 relative z-10">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.2)] p-10 border border-white/30">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 rounded-2xl flex items-center justify-center shadow-xl shadow-teal-500/40">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-accent/30 to-transparent rounded-2xl"></div>
                <svg className="w-7 h-7 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-700 via-teal-800 to-teal-900 bg-clip-text text-transparent">
                Matnog Portal
              </h1>
            </div>
          </div>

          {/* Welcome */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome Back 👋
            </h2>
            <p className="text-gray-600 text-sm">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3 animate-fadeIn">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Login Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError("")}
                className="text-red-500 hover:text-red-700"
                type="button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="w-full px-4 py-3 border border-teal-200 rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-600 transition-all duration-300 bg-white/90"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-teal-200 rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-600 transition-all duration-300 bg-white/90"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-teal-600 rounded focus:ring-0"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-teal-600 hover:text-teal-700 font-semibold transition"
              >
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-600 via-teal-700 to-teal-800 text-white py-3 rounded-xl font-semibold shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? (
                <div className="flex justify-center items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center justify-center gap-2 text-gray-400 text-sm">
            <span className="h-[1px] w-10 bg-gray-300"></span>
            <span>or</span>
            <span className="h-[1px] w-10 bg-gray-300"></span>
          </div>

          {/* Register */}
          <Link
            to="/register"
            className="w-full inline-flex justify-center items-center gap-2 bg-gradient-to-r from-yellow-warm to-yellow-accent hover:from-yellow-accent hover:to-yellow-warm text-teal-900 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            Create an Account 🎉
          </Link>
        </div>
      </div>

      {/* Subtle bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 opacity-80">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-16"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            className="fill-teal-800/40"
          ></path>
        </svg>
      </div>
    </div>
  );
}
