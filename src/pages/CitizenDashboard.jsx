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
      path: "/projects",
      description: "View all municipal projects",
      color: "blue",
    },
    {
      title: "Barangays",
      value: stats.barangays,
      path: "/barangays",
      description: "Explore barangay information",
      color: "green",
    },
    {
      title: "Contractors",
      value: stats.contractors,
      path: "/contractors",
      description: "Registered contractors",
      color: "yellow",
    },
    {
      title: "Officials",
      value: stats.officials,
      path: "/officials",
      description: "Government officials",
      color: "purple",
    },
    {
      title: "Transactions",
      value: stats.transactions,
      path: "/financials",
      description: "Financial records",
      color: "indigo",
    },
    {
      title: "Documents",
      value: stats.documents,
      path: "/documents",
      description: "Public documents",
      color: "gray",
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-700 to-teal-800 bg-clip-text text-transparent mb-2">Administrative Dashboard</h1>
              <p className="text-lg text-teal-600 font-medium">Municipal Transparency & Project Management System</p>
            </div>
            <div className="w-full md:w-auto md:max-w-md">
              <GlobalSearch />
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {statCards.map((card) => (
            <Link
              key={card.title}
              to={card.path}
              className="bg-white rounded-2xl shadow-lg border border-teal-100 p-8 hover:shadow-xl hover:border-teal-300 transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
            >
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-teal-700 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-500">{card.description}</p>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-4xl font-extrabold bg-gradient-to-r from-teal-700 to-teal-800 bg-clip-text text-transparent">
                    {card.value.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center text-teal-600 text-sm font-medium mt-4">
                  <span>View Details</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Map Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-teal-700 to-teal-800 bg-clip-text text-transparent">Matnog Municipality Map</h2>
            <Link 
              to="/map" 
              className="text-sm text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1"
            >
              View Full Map →
            </Link>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-teal-100 hover:shadow-xl hover:border-teal-300 transition-all duration-300 overflow-hidden">
            <div className="relative" style={{ height: "400px" }}>
              <iframe
                src="https://www.google.com/maps?q=Matnog,+Sorsogon&z=12&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Matnog Municipality - Google Maps"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Financial Overview */}
        {currentYearFinancials && (
          <div className="mb-12">
            <h2 className="text-xl font-bold bg-gradient-to-r from-teal-700 to-teal-800 bg-clip-text text-transparent mb-6">Financial Overview ({currentYearFinancials.year})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-2xl shadow-lg border border-teal-100 hover:shadow-xl hover:border-teal-300 transition-all duration-300 p-6">
                <p className="text-sm font-medium text-gray-500 mb-2">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₱{(currentYearFinancials.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg border border-teal-100 hover:shadow-xl hover:border-teal-300 transition-all duration-300 p-6">
                <p className="text-sm font-medium text-gray-500 mb-2">Total Expenditures</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₱{(currentYearFinancials.total_expenditures || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg border border-teal-100 hover:shadow-xl hover:border-teal-300 transition-all duration-300 p-6">
                <p className="text-sm font-medium text-gray-500 mb-2">Fiscal Balance</p>
                <p className={`text-2xl font-bold ${currentYearFinancials.fiscal_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₱{(currentYearFinancials.fiscal_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg border border-teal-100 hover:shadow-xl hover:border-teal-300 transition-all duration-300 p-6">
                <p className="text-sm font-medium text-gray-500 mb-2">Net Equity</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₱{(currentYearFinancials.assets?.net_equity || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            {/* Revenue vs Expenditures Chart */}
            <div className="bg-white rounded-2xl shadow-lg border border-teal-100 hover:shadow-xl hover:border-teal-300 transition-all duration-300 p-6">
              <h3 className="text-lg font-semibold text-teal-700 mb-4">Revenue vs Expenditures</h3>
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
            <h2 className="text-xl font-bold bg-gradient-to-r from-teal-700 to-teal-800 bg-clip-text text-transparent mb-6">Projects Budget Summary</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-2xl shadow-lg border border-teal-100 hover:shadow-xl hover:border-teal-300 transition-all duration-300 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Total Budget Allocated</p>
                    <p className="text-xl font-bold text-gray-900 break-words">
                      ₱{(projectFinancials.total_budget_allocated || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-400">Across all projects</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Total Amount Spent</p>
                    <p className="text-xl font-bold text-orange-600 break-words">
                      ₱{(projectFinancials.total_amount_spent || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-400">From all project transactions</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Total Remaining Budget</p>
                    <p className="text-xl font-bold text-green-600 break-words">
                      ₱{(projectFinancials.total_remaining_budget || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-400">Available for projects</p>
                  </div>
                </div>
              </div>
              {/* Budget Chart */}
              <div className="bg-white rounded-2xl shadow-lg border border-teal-100 hover:shadow-xl hover:border-teal-300 transition-all duration-300 p-6">
                <h3 className="text-lg font-semibold text-teal-700 mb-4">Budget Allocation Overview</h3>
                <BudgetChart
                  allocated={projectFinancials.total_budget_allocated || 0}
                  spent={projectFinancials.total_amount_spent || 0}
                  remaining={projectFinancials.total_remaining_budget || 0}
                />
              </div>
            </div>
            {/* Project Status Chart */}
            {projects.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-teal-100 hover:shadow-xl hover:border-teal-300 transition-all duration-300 p-6">
                <h3 className="text-lg font-semibold text-teal-700 mb-4">Project Status Distribution</h3>
                <ProjectStatusChart projects={projects} />
              </div>
            )}
          </div>
        )}

        {/* Transaction Trends */}
        {transactions.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold bg-gradient-to-r from-teal-700 to-teal-800 bg-clip-text text-transparent mb-6">Transaction Trends</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg border border-teal-100 hover:shadow-xl hover:border-teal-300 transition-all duration-300 p-6">
                <h3 className="text-lg font-semibold text-teal-700 mb-4">Monthly Income vs Expenses</h3>
                <MonthlyTransactionChart transactions={transactions} />
              </div>
              <div className="bg-white rounded-2xl shadow-lg border border-teal-100 hover:shadow-xl hover:border-teal-300 transition-all duration-300 p-6">
                <h3 className="text-lg font-semibold text-teal-700 mb-4">Transaction Type Breakdown</h3>
                <TransactionTypeChart transactions={transactions} />
              </div>
            </div>
          </div>
        )}

        {/* Financial Trends Over Years */}
        {financialRecords.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold bg-gradient-to-r from-teal-700 to-teal-800 bg-clip-text text-transparent mb-6">Financial Trends (Multi-Year)</h2>
            <div className="bg-white rounded-2xl shadow-lg border border-teal-100 hover:shadow-xl hover:border-teal-300 transition-all duration-300 p-6">
              <RevenueExpenseChart records={financialRecords} />
            </div>
          </div>
        )}

        {/* Barangays List */}
        {barangays.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-700 to-teal-800 bg-clip-text text-transparent">Barangays</h2>
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
                  <Link
                    key={barangay.id}
                    to={`/barangays/${barangay.id}`}
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-700 text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0 shadow-md shadow-teal-500/30">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-900 hover:text-teal-600 transition-colors truncate flex-1">
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
            <h2 className="text-xl font-bold bg-gradient-to-r from-teal-700 to-teal-800 bg-clip-text text-transparent mb-6">Top Barangay IRA Shares</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg border border-teal-100 hover:shadow-xl hover:border-teal-300 transition-all duration-300 p-8">
                <div className="space-y-4">
                  {barangayIRAShares.slice(0, 10).map((barangay, index) => (
                    <div key={barangay.barangay_id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-700 text-white rounded-lg flex items-center justify-center font-bold shadow-md shadow-teal-500/30">
                          {index + 1}
                        </div>
                        <Link 
                          to={`/barangays/${barangay.barangay_id}`}
                          className="text-lg font-medium text-gray-900 hover:text-teal-600 transition-colors"
                        >
                          {barangay.barangay_name}
                        </Link>
                      </div>
                      <span className="text-lg font-bold text-teal-600">
                        ₱{(barangay.ira_share || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Barangay IRA Chart */}
              <div className="bg-white rounded-2xl shadow-lg border border-teal-100 hover:shadow-xl hover:border-teal-300 transition-all duration-300 p-6">
                <h3 className="text-lg font-semibold text-teal-700 mb-4">Top 10 Barangay IRA Shares Comparison</h3>
                <BarangayIRAChart barangays={barangayIRAShares} />
              </div>
            </div>
          </div>
        )}

        {/* Recent Projects */}
        {recentProjects.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-700 to-teal-800 bg-clip-text text-transparent">Recent Projects</h2>
              <Link to="/projects" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                View All Projects →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects#project-${project.id}`}
                  state={{ scrollToProject: project.id }}
                  className="bg-white rounded-2xl shadow-lg border border-teal-100 hover:shadow-xl hover:border-teal-300 transition-all duration-300 p-6 hover:shadow-md transition-shadow duration-200"
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
        <div className="bg-gradient-to-r from-teal-50 to-blue-100 border-l-4 border-teal-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg flex items-center justify-center shadow-md shadow-teal-500/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-teal-900 font-bold text-lg mb-1">Transparency & Accountability</h3>
              <p className="text-teal-800 text-sm leading-relaxed">
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
