import { Link } from "react-router-dom";

export default function Welcome() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-blue-300 text-center">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full">
        <h1 className="text-4xl font-bold text-blue-700 mb-4">
          Welcome to TracePer
        </h1>
        <p className="text-gray-600 mb-8">
          Track transparency and project progress in your barangay easily.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            to="/login"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 bg-yellow-400 text-blue-800 font-semibold rounded-lg shadow hover:bg-yellow-300 transition"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
