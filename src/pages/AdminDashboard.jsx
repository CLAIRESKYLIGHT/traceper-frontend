import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import GlobalSearch from "../components/GlobalSearch";
import { useAuth } from "../utils/useAuth";
import FinancialChart from "../components/charts/FinancialChart";
import BudgetChart from "../components/charts/BudgetChart";
import ProjectStatusChart from "../components/charts/ProjectStatusChart";
import BarangayIRAChart from "../components/charts/BarangayIRAChart";
import RevenueExpenseChart from "../components/charts/RevenueExpenseChart";
import MonthlyTransactionChart from "../components/charts/MonthlyTransactionChart";
import TransactionTypeChart from "../components/charts/TransactionTypeChart";
import SkeletonLoader from "../components/SkeletonLoader";

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
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
  const [barangays, setBarangays] = useState([]);
  const [projects, setProjects] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [financialRecords, setFinancialRecords] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await API.get("/dashboard");
        const data = response.data?.data || response.data || {};
        
        setStats({
          projects: data.projects || 0,
          barangays: data.barangays || 0,
          contractors: data.contractors || 0,
          officials: data.officials || 0,
          transactions: data.transactions || 0,
          documents: data.documents || 0,
        });
        
        if (data.financials) setFinancials(data.financials);
        if (data.project_financials) setProjectFinancials(data.project_financials);
        if (data.barangay_ira_shares) setBarangayIRAShares(data.barangay_ira_shares || []);
        
        // Fetch projects for status chart
        try {
          const projectsRes = await API.get("/projects");
          const projectsData = projectsRes.data?.data || projectsRes.data || [];
          const projectsArray = Array.isArray(projectsData) ? projectsData : [];
          setProjects(projectsArray);
          // Get recent projects (last 5)
          setRecentProjects(projectsArray.slice(0, 5));
        } catch (err) {
          console.error("Error fetching projects:", err);
        }

        // Fetch transactions for charts
        try {
          const transactionsRes = await API.get("/transactions");
          const transactionsData = transactionsRes.data?.data || transactionsRes.data || [];
          const transactionsArray = Array.isArray(transactionsData) ? transactionsData : [];
          setTransactions(transactionsArray);
          // Get recent transactions (last 5)
          setRecentTransactions(transactionsArray.slice(0, 5));
        } catch (err) {
          console.error("Error fetching transactions:", err);
        }

        // Fetch financial records for trends
        try {
          const recordsRes = await API.get("/financial-records");
          const recordsData = recordsRes.data?.data || recordsRes.data || [];
          setFinancialRecords(Array.isArray(recordsData) ? recordsData : []);
        } catch (err) {
          console.error("Error fetching financial records:", err);
        }

        // Fetch barangays for the list
        try {
          const barangaysRes = await API.get("/barangays");
          const barangaysData = barangaysRes.data?.data || barangaysRes.data || [];
          setBarangays(Array.isArray(barangaysData) ? barangaysData : []);
        } catch (err) {
          console.error("Error fetching barangays:", err);
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
      title: "Projects",
      value: stats.projects,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-8H7v8M7 3v5h8" />
        </svg>
      ),
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Barangays",
      value: stats.barangays,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: "green",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Contractors",
      value: stats.contractors,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: "yellow",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
    },
    {
      title: "Officials",
      value: stats.officials,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: "purple",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Transactions",
      value: stats.transactions,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "indigo",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      title: "Documents",
      value: stats.documents,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: "gray",
      bgColor: "bg-gray-50",
      iconColor: "text-gray-600",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-100 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="animate-pulse">
            <div className="h-12 bg-teal-200 rounded-lg w-96 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-40 bg-teal-100 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-700 to-teal-800 bg-clip-text text-transparent mb-2">Administrative Dashboard</h1>
              <p className="text-lg text-teal-600 font-medium">Municipal Transparency & Project Management System</p>
            </div>
            <div className="w-full md:w-auto md:max-w-md">
              <GlobalSearch />
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {statCards.map((card, index) => (
            <div
              key={card.title}
              className="card-stat animate-fadeInUp"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="relative">
                  <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-4 rounded-xl shadow-lg shadow-teal-500/30">
                    <div className="text-white">{card.icon}</div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-accent rounded-full border-2 border-white animate-pulse"></div>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-3">{card.title}</p>
                <p className="text-5xl font-extrabold bg-gradient-to-r from-teal-700 via-teal-800 to-teal-900 bg-clip-text text-transparent leading-none mb-2">
                  {card.value.toLocaleString()}
                </p>
                <div className="h-1 w-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Section Divider */}
        <div className="section-divider mb-16"></div>

        {/* Financial Overview */}
        {financials && (
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-1 w-16 bg-gradient-to-r from-teal-600 to-teal-700 rounded-full"></div>
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-teal-700 via-teal-800 to-teal-900 bg-clip-text text-transparent">
                Financial Overview ({financials.year})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card-stat group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">Revenue</span>
                </div>
                <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-2">Total Revenue</p>
                <p className="text-3xl font-extrabold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                  ₱{(financials.revenue?.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="card-stat group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">Expenses</span>
                </div>
                <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-2">Total Expenditures</p>
                <p className="text-3xl font-extrabold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                  ₱{(financials.expenditures?.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="card-stat group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${financials.fiscal_balance >= 0 ? 'from-green-400 to-green-600' : 'from-red-400 to-red-600'} rounded-xl flex items-center justify-center shadow-lg`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${financials.fiscal_balance >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                    {financials.fiscal_balance >= 0 ? 'Positive' : 'Negative'}
                  </span>
                </div>
                <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-2">Fiscal Balance</p>
                <p className={`text-3xl font-extrabold ${financials.fiscal_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₱{(financials.fiscal_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="card-stat group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-full">Equity</span>
                </div>
                <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-2">Net Equity</p>
                <p className="text-3xl font-extrabold bg-gradient-to-r from-teal-700 to-teal-800 bg-clip-text text-transparent">
                  ₱{(financials.assets?.net_equity || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            {/* Revenue vs Expenditures Chart */}
            <div className="card-modern">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-teal-500 to-teal-600 rounded-full"></div>
                <h3 className="text-xl font-bold text-teal-800">Revenue vs Expenditures</h3>
              </div>
              <FinancialChart 
                revenue={financials.revenue?.total || 0}
                expenditures={financials.expenditures?.total || 0}
                year={financials.year}
              />
            </div>
          </div>
        )}

        {/* Section Divider */}
        <div className="section-divider mb-16"></div>

        {/* Projects Budget Summary */}
        {projectFinancials && (
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-1 w-16 bg-gradient-to-r from-teal-600 to-teal-700 rounded-full"></div>
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-teal-700 via-teal-800 to-teal-900 bg-clip-text text-transparent">
                Projects Budget Summary
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-2xl shadow-lg border border-teal-100 hover:shadow-xl hover:border-teal-300 transition-all duration-300 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Total Budget Allocated</p>
                    <p className="text-2xl font-bold text-gray-900 break-words">
                      ₱{(projectFinancials.total_budget_allocated || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-400">Across all projects</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Total Amount Spent</p>
                    <p className="text-2xl font-bold text-orange-600 break-words">
                      ₱{(projectFinancials.total_amount_spent || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-400">From all project transactions</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Total Remaining Budget</p>
                    <p className="text-2xl font-bold text-green-600 break-words">
                      ₱{(projectFinancials.total_remaining_budget || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-400">Available for projects</p>
                  </div>
                </div>
              </div>
              {/* Budget Chart */}
              <div className="card-modern">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-teal-500 to-teal-600 rounded-full"></div>
                  <h3 className="text-xl font-bold text-teal-800">Budget Allocation Overview</h3>
                </div>
                <BudgetChart
                  allocated={projectFinancials.total_budget_allocated || 0}
                  spent={projectFinancials.total_amount_spent || 0}
                  remaining={projectFinancials.total_remaining_budget || 0}
                />
              </div>
            </div>
            {/* Project Status Chart */}
            {projects.length > 0 && (
              <div className="card-modern mt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-teal-500 to-teal-600 rounded-full"></div>
                  <h3 className="text-xl font-bold text-teal-800">Project Status Distribution</h3>
                </div>
                <ProjectStatusChart projects={projects} />
              </div>
            )}
          </div>
        )}

        {/* Section Divider */}
        <div className="section-divider mb-16"></div>

        {/* Transaction Trends */}
        {transactions.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-1 w-16 bg-gradient-to-r from-teal-600 to-teal-700 rounded-full"></div>
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-teal-700 via-teal-800 to-teal-900 bg-clip-text text-transparent">
                Transaction Trends
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card-modern">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-teal-500 to-teal-600 rounded-full"></div>
                  <h3 className="text-xl font-bold text-teal-800">Monthly Income vs Expenses</h3>
                </div>
                <MonthlyTransactionChart transactions={transactions} />
              </div>
              <div className="card-modern">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-teal-500 to-teal-600 rounded-full"></div>
                  <h3 className="text-xl font-bold text-teal-800">Transaction Type Breakdown</h3>
                </div>
                <TransactionTypeChart transactions={transactions} />
              </div>
            </div>
          </div>
        )}

        {/* Section Divider */}
        <div className="section-divider mb-16"></div>

        {/* Financial Trends Over Years */}
        {financialRecords.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-1 w-16 bg-gradient-to-r from-teal-600 to-teal-700 rounded-full"></div>
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-teal-700 via-teal-800 to-teal-900 bg-clip-text text-transparent">
                Financial Trends (Multi-Year)
              </h2>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-teal-100 hover:shadow-xl hover:border-teal-300 transition-all duration-300 p-6">
              <RevenueExpenseChart records={financialRecords} />
            </div>
          </div>
        )}

        {/* Section Divider */}
        <div className="section-divider mb-16"></div>

        {/* Recent Activity */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-1 w-16 bg-gradient-to-r from-teal-600 to-teal-700 rounded-full"></div>
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-teal-700 via-teal-800 to-teal-900 bg-clip-text text-transparent">
              Recent Activity
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Projects */}
            <div className="card-modern">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-teal-500 to-teal-600 rounded-full"></div>
                  <h3 className="text-xl font-bold text-teal-800">Recent Projects</h3>
                </div>
                <Link to="/projects" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                  View All →
                </Link>
              </div>
              {recentProjects.length > 0 ? (
                <div className="space-y-3">
                  {recentProjects.map((project) => {
                    const statusColor = project.status === 'Completed' ? 'bg-green-500' :
                      project.status === 'In Progress' ? 'bg-blue-500' :
                      project.status === 'Delayed' ? 'bg-yellow-500' : 'bg-gray-400';
                    return (
                      <Link
                        key={project.id}
                        to={`/projects#project-${project.id}`}
                        state={{ scrollToProject: project.id }}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <div className={`w-2 h-2 rounded-full mt-2 ${statusColor}`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{project.title}</p>
                          <p className="text-sm text-gray-600">{project.barangay?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Budget: ₱{(project.budget_allocated || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No recent projects</p>
              )}
            </div>

            {/* Recent Transactions */}
            <div className="card-modern">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-teal-500 to-teal-600 rounded-full"></div>
                  <h3 className="text-xl font-bold text-teal-800">Recent Transactions</h3>
                </div>
                <Link to="/financials" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                  View All →
                </Link>
              </div>
              {recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {recentTransactions.map((tx) => {
                    const typeColor = tx.type === 'Income' ? 'bg-green-500' : 'bg-red-500';
                    return (
                      <div key={tx.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className={`w-2 h-2 rounded-full mt-2 ${typeColor}`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{tx.description || 'No description'}</p>
                        <p className="text-sm text-gray-600">{tx.project?.title || 'N/A'}</p>
                        <p className={`text-sm font-semibold mt-1 ${
                          tx.type === 'Income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {tx.type === 'Income' ? '+' : '-'}₱{(parseFloat(tx.amount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No recent transactions</p>
              )}
            </div>
          </div>
        </div>

        {/* Section Divider */}
        <div className="section-divider mb-16"></div>

        {/* Barangays List */}
        {barangays.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="h-1 w-16 bg-gradient-to-r from-teal-600 to-teal-700 rounded-full"></div>
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-teal-700 via-teal-800 to-teal-900 bg-clip-text text-transparent">
                  Barangays
                </h2>
              </div>
              <Link 
                to="/barangays" 
                className="text-sm text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1"
              >
                View All Barangays →
              </Link>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-teal-100 hover:shadow-xl hover:border-teal-300 transition-all duration-300 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {barangays.slice(0, 6).map((barangay) => (
                  <div key={barangay.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                      <Link 
                        to={`/barangays/${barangay.id}`}
                        className="font-medium text-gray-900 hover:text-teal-600 transition-colors truncate flex-1"
                      >
                        {barangay.name}
                      </Link>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/barangays/${barangay.id}`);
                        }}
                        className="p-2 text-teal-600 hover:text-white hover:bg-teal-600 rounded-lg transition-all border border-teal-200 hover:border-teal-600 flex-shrink-0 ml-2"
                        title="View/Edit Barangay"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section Divider */}
        <div className="section-divider mb-16"></div>

        {/* Top Barangay IRA Shares */}
        {barangayIRAShares.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="h-1 w-16 bg-gradient-to-r from-teal-600 to-teal-700 rounded-full"></div>
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-teal-700 via-teal-800 to-teal-900 bg-clip-text text-transparent">
                  Top Barangay IRA Shares
                </h2>
              </div>
              {isAdmin && (
                <Link 
                  to="/barangay-ira-shares" 
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1"
                >
                  Manage IRA Shares →
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg border border-teal-100 hover:shadow-xl hover:border-teal-300 transition-all duration-300 p-8">
                <div className="space-y-4">
                  {barangayIRAShares.slice(0, 10).map((barangay, index) => (
                    <div key={barangay.barangay_id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0 group hover:bg-gray-50 transition-colors rounded-lg px-2 -mx-2">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-700 text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0 shadow-md shadow-teal-500/30">
                          {index + 1}
                        </div>
                        <Link 
                          to={`/barangays/${barangay.barangay_id}`}
                          className="text-lg font-medium text-gray-900 hover:text-teal-600 transition-colors truncate flex-1"
                        >
                          {barangay.barangay_name}
                        </Link>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-teal-600 whitespace-nowrap">
                          ₱{(barangay.ira_share || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        {isAdmin && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              navigate('/barangay-ira-shares');
                            }}
                            className="p-2 text-teal-600 hover:text-white hover:bg-teal-600 rounded-lg transition-all border border-teal-200 hover:border-teal-600 flex-shrink-0"
                            title="Edit IRA Share"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Barangay IRA Chart */}
              <div className="card-modern">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-teal-500 to-teal-600 rounded-full"></div>
                  <h3 className="text-xl font-bold text-teal-800">Top 10 Barangay IRA Shares Comparison</h3>
                </div>
                <BarangayIRAChart barangays={barangayIRAShares} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
