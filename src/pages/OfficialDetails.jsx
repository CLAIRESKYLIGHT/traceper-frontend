import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import Toast from "../components/Toast";

export default function OfficialDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [official, setOfficial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchOfficial = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/officials/${id}`);
        const officialData = response.data?.data || response.data;
        setOfficial(officialData);
      } catch (err) {
        console.error("Error fetching official:", err);
        setError("Failed to load official details.");
        setToast({ message: "Failed to load official details.", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOfficial();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-teal-200 rounded-lg w-64"></div>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !official) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Official Not Found</h2>
            <p className="text-gray-600 mb-6">{error || "The official you're looking for doesn't exist."}</p>
            <button
              onClick={() => navigate("/officials")}
              className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg font-semibold hover:from-teal-700 hover:to-teal-800 transition-all shadow-md hover:shadow-lg"
            >
              Back to Officials
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/officials")}
          className="mb-6 flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Officials
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-teal-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-teal-800 px-8 py-12">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Photo */}
              <div className="relative">
                <div className="w-40 h-40 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center shadow-2xl">
                  {official.photo ? (
                    <img 
                      src={official.photo} 
                      alt={official.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-accent/30 to-yellow-warm/30 flex items-center justify-center">
                      <span className="text-6xl font-bold text-white">
                        {official.name?.charAt(0).toUpperCase() || "O"}
                      </span>
                    </div>
                  )}
                </div>
                {!official.barangay_id && (
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-yellow-warm to-yellow-accent rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                    <svg className="w-6 h-6 text-teal-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Name and Position */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold text-white mb-3">{official.name}</h1>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-lg font-semibold text-white">{official.position}</span>
                </div>
                {official.barangay && (
                  <div className="flex items-center gap-2 text-white/90">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="text-lg">{official.barangay.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Information Section */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Contact & Office Info */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-700 to-teal-800 bg-clip-text text-transparent mb-6">
                    Contact Information
                  </h2>
                  {official.contact ? (
                    <div className="bg-teal-50 rounded-xl p-6 border border-teal-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg flex items-center justify-center shadow-md">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide mb-1">Contact</p>
                          <p className="text-lg font-medium text-gray-900">{official.contact}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center">
                      <p className="text-gray-500">No contact information available</p>
                    </div>
                  )}
                </div>

                {/* Office Information */}
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-700 to-teal-800 bg-clip-text text-transparent mb-6">
                    Office Information
                  </h2>
                  <div className="bg-gradient-to-br from-teal-50 to-blue-100 rounded-xl p-6 border border-teal-100 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide mb-1">Position</p>
                        <p className="text-lg font-semibold text-gray-900">{official.position}</p>
                      </div>
                    </div>
                    {official.barangay && (
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide mb-1">Barangay</p>
                          <p className="text-lg font-semibold text-gray-900">{official.barangay.name}</p>
                        </div>
                      </div>
                    )}
                    {!official.barangay_id && (
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-warm to-yellow-accent rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                          <svg className="w-6 h-6 text-teal-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide mb-1">Office Type</p>
                          <p className="text-lg font-semibold text-gray-900">Municipal Office</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Projects & Transactions */}
              <div className="space-y-6">
                {/* Projects Involved */}
                {official.projects && official.projects.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-700 to-teal-800 bg-clip-text text-transparent mb-6">
                      Projects Involved ({official.projects.length})
                    </h2>
                    <div className="bg-white rounded-xl border border-teal-100 p-6 space-y-3 max-h-96 overflow-y-auto">
                      {official.projects.map((project) => (
                        <div key={project.id} className="p-4 bg-teal-50 rounded-lg border border-teal-100 hover:bg-teal-100 transition-colors">
                          <h3 className="font-semibold text-gray-900 mb-1">{project.title}</h3>
                          <p className="text-sm text-gray-600">{project.barangay?.name || "N/A"}</p>
                          {project.status && (
                            <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-semibold ${
                              project.status === 'Completed' ? 'bg-green-100 text-green-700' :
                              project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {project.status}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transactions Authorized */}
                {official.transactions && official.transactions.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-700 to-teal-800 bg-clip-text text-transparent mb-6">
                      Transactions Authorized ({official.transactions.length})
                    </h2>
                    <div className="bg-white rounded-xl border border-teal-100 p-6">
                      <div className="space-y-3">
                        {official.transactions.slice(0, 5).map((tx) => (
                          <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{tx.description || "No description"}</p>
                              <p className="text-sm text-gray-600">{new Date(tx.date || tx.created_at).toLocaleDateString()}</p>
                            </div>
                            <p className={`font-bold ${
                              tx.type === 'Income' || tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {tx.type === 'Income' || tx.type === 'income' ? '+' : '-'}₱{(parseFloat(tx.amount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                        ))}
                        {official.transactions.length > 5 && (
                          <p className="text-center text-sm text-gray-500 pt-2">
                            +{official.transactions.length - 5} more transactions
                          </p>
                        )}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-700">Total Amount:</span>
                          <span className="text-xl font-bold text-teal-600">
                            ₱{official.transactions.reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

