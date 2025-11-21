import { useEffect, useState } from "react";
import API from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    projects: 0,
    barangays: 0,
    contractors: 0,
    officials: 0,
    transactions: 0,
    documents: 0,
  });
  const [financials, setFinancials] = useState(null);
  const [projectFinancials, setProjectFinancials] = useState(null);
  const [barangayIRAShares, setBarangayIRAShares] = useState([]);
  const [previousYear, setPreviousYear] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await API.get("/dashboard");
        const data = response.data?.data || response.data || {};
        
        // Basic counts
        setStats({
          projects: data.projects || 0,
          barangays: data.barangays || 0,
          contractors: data.contractors || 0,
          officials: data.officials || 0,
          transactions: data.transactions || 0,
          documents: data.documents || 0,
        });
        
        // Financial data
        if (data.financials) {
          setFinancials(data.financials);
        }
        if (data.project_financials) {
          setProjectFinancials(data.project_financials);
        }
        if (data.barangay_ira_shares) {
          setBarangayIRAShares(data.barangay_ira_shares || []);
        }
        if (data.previous_year) {
          setPreviousYear(data.previous_year);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Projects",
      value: stats.projects,
      icon: "🏗️",
      color: "blue",
      description: "Active projects",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Barangays",
      value: stats.barangays,
      icon: "🏠",
      color: "blue",
      description: "Covered areas",
      gradient: "from-blue-600 to-blue-700",
    },
    {
      title: "Contractors",
      value: stats.contractors,
      icon: "⚙️",
      color: "yellow",
      description: "Registered partners",
      gradient: "from-yellow-400 to-yellow-500",
    },
    {
      title: "Officials",
      value: stats.officials,
      icon: "👥",
      color: "blue",
      description: "Government officials",
      gradient: "from-blue-400 to-blue-500",
    },
    {
      title: "Transactions",
      value: stats.transactions,
      icon: "💰",
      color: "green",
      description: "Financial records",
      gradient: "from-green-400 to-green-500",
    },
    {
      title: "Documents",
      value: stats.documents,
      icon: "📄",
      color: "purple",
      description: "Public documents",
      gradient: "from-purple-400 to-purple-500",
    },
  ];

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-gray-200 p-6 rounded-2xl h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Dashboard Overview
          </h2>
          <p className="text-gray-600">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
            <p className="text-sm text-yellow-800">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {statCards.map((card, index) => (
          <div
            key={card.title}
            className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-xl bg-gradient-to-r ${card.gradient} shadow-md`}
              >
                <span className="text-2xl">{card.icon}</span>
              </div>
              <div className="text-right">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-gray-600 text-sm font-medium">{card.title}</p>
              <p className="text-3xl font-bold text-gray-800">
                {card.value.toLocaleString()}
              </p>
              <p className="text-gray-500 text-xs">{card.description}</p>
            </div>

            {/* Progress indicator */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${card.gradient} transition-all duration-1000 ease-out`}
                  style={{
                    width: `${Math.min((card.value / 100) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Financial Overview */}
      {financials && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Financial Overview ({financials.year})
          </h2>
          
          {/* Financial Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800">
                ₱{(financials.revenue?.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Expenditures</p>
              <p className="text-2xl font-bold text-gray-800">
                ₱{(financials.expenditures?.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r shadow-md ${
                  financials.fiscal_balance >= 0 
                    ? 'from-green-500 to-green-600' 
                    : 'from-orange-500 to-orange-600'
                }`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 text-sm font-medium mb-1">Fiscal Balance</p>
              <p className={`text-2xl font-bold ${
                financials.fiscal_balance >= 0 ? 'text-green-600' : 'text-orange-600'
              }`}>
                ₱{(financials.fiscal_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 text-sm font-medium mb-1">Revenue Growth</p>
              <p className="text-2xl font-bold text-gray-800">
                {previousYear ? (
                  <>
                    ₱{(financials.revenue_growth || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className="text-sm text-green-600 ml-2">
                      ({previousYear.total_revenue > 0 
                        ? (((financials.revenue?.total || 0) - previousYear.total_revenue) / previousYear.total_revenue * 100).toFixed(1)
                        : 0}%)
                    </span>
                  </>
                ) : (
                  'N/A'
                )}
              </p>
            </div>
          </div>

          {/* Revenue vs Expenditures Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Revenue vs Expenditures</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Revenue</span>
                  <span className="text-sm font-bold text-green-600">
                    ₱{(financials.revenue?.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-green-500 h-4 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${Math.min(((financials.revenue?.total || 0) / Math.max(financials.revenue?.total || 0, financials.expenditures?.total || 0, 1)) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Expenditures</span>
                  <span className="text-sm font-bold text-red-600">
                    ₱{(financials.expenditures?.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-red-500 h-4 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${Math.min(((financials.expenditures?.total || 0) / Math.max(financials.revenue?.total || 0, financials.expenditures?.total || 0, 1)) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Assets & Liabilities */}
          {financials.assets && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <p className="text-gray-600 text-sm font-medium mb-2">Total Assets</p>
                <p className="text-2xl font-bold text-gray-800">
                  ₱{(financials.assets.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <p className="text-gray-600 text-sm font-medium mb-2">Total Liabilities</p>
                <p className="text-2xl font-bold text-gray-800">
                  ₱{(financials.assets.liabilities || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <p className="text-gray-600 text-sm font-medium mb-2">Net Equity</p>
                <p className="text-2xl font-bold text-green-600">
                  ₱{(financials.assets.net_equity || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Project Financials */}
      {projectFinancials && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Project Financials</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Budget Allocated</p>
              <p className="text-xl font-bold text-gray-800">
                ₱{(projectFinancials.total_budget_allocated || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Amount Spent</p>
              <p className="text-xl font-bold text-orange-600">
                ₱{(projectFinancials.total_amount_spent || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Remaining Budget</p>
              <p className="text-xl font-bold text-green-600">
                ₱{(projectFinancials.total_remaining_budget || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Transactions</p>
              <p className="text-xl font-bold text-blue-600">
                ₱{(projectFinancials.total_transactions || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Barangay IRA Distribution */}
      {barangayIRAShares.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Top Barangay IRA Shares</h3>
          <div className="space-y-3">
            {barangayIRAShares.slice(0, 10).map((barangay, index) => (
              <div key={barangay.barangay_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">{barangay.barangay_name}</span>
                </div>
                <span className="font-bold text-blue-600">
                  ₱{(barangay.ira_share || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
