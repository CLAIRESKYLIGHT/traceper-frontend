import { Link } from "react-router-dom";

export default function Welcome() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Aerial Image Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/matnog-aerial.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 via-blue-800/70 to-blue-900/80"></div>
        <div className="absolute inset-0 bg-black/20"></div>
      </div>
      
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
      
      {/* Navbar */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6 backdrop-blur-sm bg-white/80 border-b border-gray-200/50">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-yellow-400/30 group-hover:scale-110 transition-transform duration-300 animate-float">
            <span className="text-yellow-400 font-bold text-xl">T</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              TracePer
            </h1>
            <p className="text-xs text-gray-500">Transparency Portal</p>
          </div>
        </Link>
        <div className="hidden sm:flex gap-4">
          <Link
            to="/login"
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-6 py-2.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Register
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 relative z-10">
        <div className="max-w-4xl mx-auto animate-fadeIn">
          <div className="mb-8 animate-scaleIn">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-blue-700 rounded-full text-sm font-semibold mb-6 shadow-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Municipality of Matnog Transparency Portal
            </div>
          </div>
          
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-slideDown">
            <span className="text-white drop-shadow-lg">
              TRACEPER
            </span>
            <br />
            <span className="text-yellow-400 drop-shadow-lg text-4xl sm:text-5xl lg:text-6xl">
              Municipality of Matnog
            </span>
          </h2>
          
          <p className="text-xl sm:text-2xl text-white/95 max-w-3xl mx-auto mb-8 leading-relaxed animate-slideUp drop-shadow-md">
            Transparency Portal for the Municipality of Matnog — empowering citizens
            with open access to government projects, financial records, and public information.
          </p>

          {/* TRACEPER Acronym */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 mb-12 border border-white/20 shadow-2xl max-w-4xl mx-auto animate-scaleIn" style={{ animationDelay: "0.2s" }}>
            <h3 className="text-2xl font-bold text-center mb-6 text-gray-900">
              What is TRACEPER?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                <div className="text-3xl font-bold text-blue-600 mb-2">T</div>
                <p className="text-sm font-semibold text-gray-800">Transparency</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                <div className="text-3xl font-bold text-blue-600 mb-2">R</div>
                <p className="text-sm font-semibold text-gray-800">Rule of Law</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                <div className="text-3xl font-bold text-blue-600 mb-2">A</div>
                <p className="text-sm font-semibold text-gray-800">Accountability</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                <div className="text-3xl font-bold text-blue-600 mb-2">C</div>
                <p className="text-sm font-semibold text-gray-800">Consensus-Oriented</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors">
                <div className="text-3xl font-bold text-yellow-600 mb-2">E</div>
                <p className="text-sm font-semibold text-gray-800">Equity & Inclusiveness</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors">
                <div className="text-3xl font-bold text-yellow-600 mb-2">P</div>
                <p className="text-sm font-semibold text-gray-800">Participation</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors">
                <div className="text-3xl font-bold text-yellow-600 mb-2">E</div>
                <p className="text-sm font-semibold text-gray-800">Effectiveness & Efficiency</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors">
                <div className="text-3xl font-bold text-yellow-600 mb-2">R</div>
                <p className="text-sm font-semibold text-gray-800">Responsiveness</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-scaleIn" style={{ animationDelay: "0.3s" }}>
            <Link
              to="/login"
              className="btn-primary-modern px-8 py-4 text-lg flex items-center gap-2 group"
            >
              Get Started
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              to="/register"
              className="btn-secondary-modern px-8 py-4 text-lg flex items-center gap-2 group"
            >
              Create Account
              <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Key Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto w-full animate-fadeIn" style={{ animationDelay: "0.5s" }}>
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 text-center group hover:scale-105 transition-transform duration-300 shadow-xl border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Transparency</h3>
            <p className="text-sm text-gray-600">Full visibility into municipal projects, budgets, and financial transactions</p>
          </div>
          
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 text-center group hover:scale-105 transition-transform duration-300 shadow-xl border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Rule of Law</h3>
            <p className="text-sm text-gray-600">All operations follow legal frameworks and regulatory compliance</p>
          </div>
          
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 text-center group hover:scale-105 transition-transform duration-300 shadow-xl border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Accountability</h3>
            <p className="text-sm text-gray-600">Track every transaction with supporting documents and official authorization</p>
          </div>
          
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 text-center group hover:scale-105 transition-transform duration-300 shadow-xl border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Consensus-Oriented</h3>
            <p className="text-sm text-gray-600">Decisions made through dialogue and stakeholder engagement</p>
          </div>
          
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 text-center group hover:scale-105 transition-transform duration-300 shadow-xl border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Equity & Inclusiveness</h3>
            <p className="text-sm text-gray-600">Equal access to information and services for all citizens</p>
          </div>
          
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 text-center group hover:scale-105 transition-transform duration-300 shadow-xl border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Participation</h3>
            <p className="text-sm text-gray-600">Citizens actively engaged in governance and decision-making processes</p>
          </div>
          
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 text-center group hover:scale-105 transition-transform duration-300 shadow-xl border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Effectiveness & Efficiency</h3>
            <p className="text-sm text-gray-600">Optimal use of resources to achieve desired results</p>
          </div>
          
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 text-center group hover:scale-105 transition-transform duration-300 shadow-xl border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Responsiveness</h3>
            <p className="text-sm text-gray-600">Timely response to citizen needs and concerns</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t border-white/20 bg-white/30 backdrop-blur-md">
        <p className="text-sm text-white drop-shadow-md">
          © {new Date().getFullYear()} TRACEPER - Municipality of Matnog. All rights reserved.
        </p>
        <p className="text-xs text-white/80 mt-2 drop-shadow-sm">
          Transparency • Rule of Law • Accountability • Consensus-Oriented • Equity & Inclusiveness • Participation • Effectiveness & Efficiency • Responsiveness
        </p>
      </footer>
    </div>
  );
}
