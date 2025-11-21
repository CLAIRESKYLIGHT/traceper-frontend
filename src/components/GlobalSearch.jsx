import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function GlobalSearch({ className = "" }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState({
    projects: [],
    barangays: [],
    documents: [],
    transactions: []
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const delayDebounce = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(delayDebounce);
    } else {
      setResults({ projects: [], barangays: [], documents: [], transactions: [] });
      setIsOpen(false);
    }
  }, [searchTerm]);

  const performSearch = async () => {
    if (!searchTerm || searchTerm.length < 2) return;
    
    setLoading(true);
    setIsOpen(true);
    
    try {
      const [projectsRes, barangaysRes, documentsRes, transactionsRes] = await Promise.allSettled([
        API.get("/projects"),
        API.get("/barangays"),
        API.get("/documents"),
        API.get("/transactions")
      ]);

      const searchLower = searchTerm.toLowerCase();
      
      const projects = projectsRes.status === "fulfilled" 
        ? (projectsRes.value.data?.data || projectsRes.value.data || []).filter(p => 
            p.title?.toLowerCase().includes(searchLower)
          ).slice(0, 3)
        : [];
      
      const barangays = barangaysRes.status === "fulfilled"
        ? (barangaysRes.value.data?.data || barangaysRes.value.data || []).filter(b =>
            b.name?.toLowerCase().includes(searchLower)
          ).slice(0, 3)
        : [];
      
      const documents = documentsRes.status === "fulfilled"
        ? (documentsRes.value.data?.data || documentsRes.value.data || []).filter(d =>
            d.title?.toLowerCase().includes(searchLower)
          ).slice(0, 3)
        : [];
      
      const transactions = transactionsRes.status === "fulfilled"
        ? (transactionsRes.value.data?.data || transactionsRes.value.data || []).filter(t =>
            t.project?.title?.toLowerCase().includes(searchLower) ||
            t.description?.toLowerCase().includes(searchLower)
          ).slice(0, 3)
        : [];

      setResults({ projects, barangays, documents, transactions });
    } catch (err) {
      console.error("Search error:", err);
      setResults({ projects: [], barangays: [], documents: [], transactions: [] });
    } finally {
      setLoading(false);
    }
  };

  const totalResults = results.projects.length + results.barangays.length + 
                      results.documents.length + results.transactions.length;

  const handleResultClick = (type, id) => {
    setIsOpen(false);
    setSearchTerm("");
    if (type === "project") navigate(`/projects`);
    else if (type === "barangay") navigate(`/barangays/${id}`);
    else if (type === "document") navigate(`/documents`);
    else if (type === "transaction") navigate(`/financials`);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm.length >= 2 && setIsOpen(true)}
          placeholder="Search..."
          className="w-full pl-9 pr-9 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 bg-white text-xs"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setIsOpen(false);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && searchTerm.length >= 2 && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-96 overflow-y-auto z-50">
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Searching...</p>
              </div>
            ) : totalResults === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-gray-500">No results found for "{searchTerm}"</p>
              </div>
            ) : (
              <div className="py-2">
                {results.projects.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase">Projects</p>
                    </div>
                    {results.projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => handleResultClick("project", project.id)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
                      >
                        <p className="font-medium text-gray-900">{project.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{project.status}</p>
                      </button>
                    ))}
                  </div>
                )}
                {results.barangays.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase">Barangays</p>
                    </div>
                    {results.barangays.map((barangay) => (
                      <button
                        key={barangay.id}
                        onClick={() => handleResultClick("barangay", barangay.id)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
                      >
                        <p className="font-medium text-gray-900">{barangay.name}</p>
                        <p className="text-xs text-gray-500 mt-1">Population: {barangay.population?.toLocaleString() || "N/A"}</p>
                      </button>
                    ))}
                  </div>
                )}
                {results.documents.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase">Documents</p>
                    </div>
                    {results.documents.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => handleResultClick("document", doc.id)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
                      >
                        <p className="font-medium text-gray-900">{doc.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{doc.project?.title || "N/A"}</p>
                      </button>
                    ))}
                  </div>
                )}
                {results.transactions.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase">Transactions</p>
                    </div>
                    {results.transactions.map((tx) => (
                      <button
                        key={tx.id}
                        onClick={() => handleResultClick("transaction", tx.id)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
                      >
                        <p className="font-medium text-gray-900">{tx.project?.title || "N/A"}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {tx.type} - ₱{parseFloat(tx.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
                {totalResults > 9 && (
                  <div className="px-4 py-3 bg-blue-50 border-t border-gray-200">
                    <p className="text-xs text-blue-600 text-center">Showing top results. Refine your search for more.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

