import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import GlobalSearch from "../components/GlobalSearch";
import ProjectStatusChart from "../components/charts/ProjectStatusChart";
import RevenueExpenseChart from "../components/charts/RevenueExpenseChart";
import FinancialChart from "../components/charts/FinancialChart";
import BudgetChart from "../components/charts/BudgetChart";
import BarangayIRAChart from "../components/charts/BarangayIRAChart";
import MonthlyTransactionChart from "../components/charts/MonthlyTransactionChart";
import TransactionTypeChart from "../components/charts/TransactionTypeChart";

export default function CitizenDashboard() {
  const [stats, setStats] = useState({
    projects: 0,
    barangays: 0,
    contractors: 0,
    officials: 0,
    transactions: 0,
    documents: 0,
  });
  const [projects, setProjects] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [financialRecords, setFinancialRecords] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [currentYearFinancials, setCurrentYearFinancials] = useState(null);
  const [projectFinancials, setProjectFinancials] = useState(null);
  const [barangayIRAShares, setBarangayIRAShares] = useState([]);
  const [barangays, setBarangays] = useState([]);
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

        if (data.financials) setCurrentYearFinancials(data.financials);
        if (data.project_financials) setProjectFinancials(data.project_financials);
        if (data.barangay_ira_shares) setBarangayIRAShares(data.barangay_ira_shares || []);

        // Fetch projects for charts
        try {
          const projectsRes = await API.get("/projects");
          const projectsData = projectsRes.data?.data || projectsRes.data || [];
          const projectsArray = Array.isArray(projectsData) ? projectsData : [];
          setProjects(projectsArray);
          setRecentProjects(projectsArray.slice(0, 5));
        } catch (err) {
          console.error("Error fetching projects:", err);
        }

        // Fetch transactions for charts
        try {
          const transactionsRes = await API.get("/transactions");
          const transactionsData = transactionsRes.data?.data || transactionsRes.data || [];
          setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
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
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded-lg w-96 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-40 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Administrative Dashboard</h1>
              <p className="text-lg text-gray-600">Municipal Transparency & Project Management System</p>
            </div>
            <div className="w-full md:w-auto md:max-w-md">
              <GlobalSearch />
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {statCards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`${card.bgColor} p-4 rounded-xl`}>
                  <div className={card.iconColor}>{card.icon}</div>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">{card.title}</p>
                <p className="text-4xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Financial Overview */}
        {currentYearFinancials && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial Overview ({currentYearFinancials.year})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-sm font-medium text-gray-500 mb-2">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₱{(currentYearFinancials.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-sm font-medium text-gray-500 mb-2">Total Expenditures</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₱{(currentYearFinancials.total_expenditures || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-sm font-medium text-gray-500 mb-2">Fiscal Balance</p>
                <p className={`text-3xl font-bold ${currentYearFinancials.fiscal_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₱{(currentYearFinancials.fiscal_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-sm font-medium text-gray-500 mb-2">Net Equity</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₱{(currentYearFinancials.assets?.net_equity || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            {/* Revenue vs Expenditures Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue vs Expenditures</h3>
              <FinancialChart 
                revenue={currentYearFinancials.total_revenue || 0}
                expenditures={currentYearFinancials.total_expenditures || 0}
                year={currentYearFinancials.year}
              />
            </div>
          </div>
        )}

        {/* Projects Budget Summary */}
        {projectFinancials && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Projects Budget Summary</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Allocation Overview</h3>
                <BudgetChart
                  allocated={projectFinancials.total_budget_allocated || 0}
                  spent={projectFinancials.total_amount_spent || 0}
                  remaining={projectFinancials.total_remaining_budget || 0}
                />
              </div>
            </div>
            {/* Project Status Chart */}
            {projects.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Status Distribution</h3>
                <ProjectStatusChart projects={projects} />
              </div>
            )}
          </div>
        )}

        {/* Transaction Trends */}
        {transactions.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Transaction Trends</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Income vs Expenses</h3>
                <MonthlyTransactionChart transactions={transactions} />
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Type Breakdown</h3>
                <TransactionTypeChart transactions={transactions} />
              </div>
            </div>
          </div>
        )}

        {/* Financial Trends Over Years */}
        {financialRecords.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial Trends (Multi-Year)</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <RevenueExpenseChart records={financialRecords} />
            </div>
          </div>
        )}

        {/* Barangays List */}
        {barangays.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Barangays</h2>
              <Link 
                to="/barangays" 
                className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
              >
                View All Barangays →
              </Link>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {barangays.slice(0, 6).map((barangay) => (
                  <Link
                    key={barangay.id}
                    to={`/barangays/${barangay.id}`}
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-900 hover:text-blue-600 transition-colors truncate flex-1">
                      {barangay.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Top Barangay IRA Shares */}
        {barangayIRAShares.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Barangay IRA Shares</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="space-y-4">
                  {barangayIRAShares.slice(0, 10).map((barangay, index) => (
                    <div key={barangay.barangay_id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <Link 
                          to={`/barangays/${barangay.barangay_id}`}
                          className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {barangay.barangay_name}
                        </Link>
                      </div>
                      <span className="text-lg font-bold text-blue-600">
                        ₱{(barangay.ira_share || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Barangay IRA Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Barangay IRA Shares Comparison</h3>
                <BarangayIRAChart barangays={barangayIRAShares} />
              </div>
            </div>
          </div>
        )}

        {/* Recent Projects */}
        {recentProjects.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Projects</h2>
              <Link to="/projects" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All Projects →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects#project-${project.id}`}
                  state={{ scrollToProject: project.id }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2 flex-1">{project.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ml-2 ${
                      project.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                      project.status === 'Delayed' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{project.barangay?.name || 'N/A'}</p>
                  <p className="text-sm font-semibold text-gray-900">
                    Budget: ₱{(project.budget_allocated || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Transparency Notice */}
        <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-blue-900 font-bold text-lg mb-1">Transparency & Accountability</h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                This portal provides public access to municipal information, project data, and official documents. 
                All information displayed is publicly available and updated regularly to ensure transparency in government operations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
