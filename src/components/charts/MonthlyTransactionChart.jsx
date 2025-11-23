import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MonthlyTransactionChart({ transactions }) {
  if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        <p>No transaction data available for chart</p>
      </div>
    );
  }

  // Group transactions by month
  const monthlyData = transactions.reduce((acc, tx) => {
    if (!tx.transaction_date) return acc;
    
    const date = new Date(tx.transaction_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthName,
        income: 0,
        expense: 0,
      };
    }
    
    const amount = parseFloat(tx.amount) || 0;
    if (tx.type === "Income" || tx.type === "income") {
      acc[monthKey].income += amount;
    } else {
      acc[monthKey].expense += amount;
    }
    
    return acc;
  }, {});

  const data = Object.values(monthlyData)
    .sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA - dateB;
    })
    .slice(-12); // Last 12 months

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        <p>No transaction data available for chart</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="month" 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          tickFormatter={(value) => `₱${(value / 1000000).toFixed(1)}M`}
        />
        <Tooltip 
          formatter={(value) => `₱${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px',
            padding: '8px'
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="income" 
          stroke="#10b981" 
          strokeWidth={2}
          dot={{ fill: '#10b981', r: 4 }}
          activeDot={{ r: 6 }}
          name="Income"
        />
        <Line 
          type="monotone" 
          dataKey="expense" 
          stroke="#ef4444" 
          strokeWidth={2}
          dot={{ fill: '#ef4444', r: 4 }}
          activeDot={{ r: 6 }}
          name="Expenses"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

