import { Link } from "react-router-dom";

export default function Welcome() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      {/* Navbar */}
      <header className="flex items-center justify-between px-10 py-6 shadow-sm bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-blue-700 font-bold text-lg">T</span>
          </div>
          <h1 className="text-2xl font-bold text-blue-800">TracePer</h1>
        </div>
        <div className="hidden sm:flex gap-4">
          <Link
            to="/login"
            className="px-5 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-5 py-2 bg-yellow-400 text-blue-900 font-semibold rounded-lg hover:bg-yellow-500 transition"
          >
            Register
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center text-center px-6">
        <h2 className="text-4xl sm:text-5xl font-bold text-blue-800 mb-4">
          Empowering Barangay Transparency
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mb-8">
          TracePer is a Barangay Project Monitoring System that keeps citizens
          informed, leaders accountable, and projects transparent — all in one
          clean platform.
        </p>
        <div className="flex gap-4">
          <Link
            to="/login"
            className="px-6 py-3 bg-blue-700 text-white font-medium rounded-lg shadow-md hover:bg-blue-800 transition"
          >
            Get Started
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 border-2 border-blue-700 text-blue-700 font-medium rounded-lg hover:bg-blue-700 hover:text-white transition"
          >
            Create Account
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 border-t text-sm text-gray-500">
        © {new Date().getFullYear()} TracePer. All rights reserved.
      </footer>
    </div>
  );
}
