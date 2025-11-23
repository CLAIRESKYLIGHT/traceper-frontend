import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function TransactionTypeChart({ transactions }) {
  if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        <p>No transaction data available for chart</p>
      </div>
    );
  }

  const income = transactions.filter(tx => tx && (tx.type === "Income" || tx.type === "income")).reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);
  const expense = transactions.filter(tx => tx && (tx.type === "Expense" || tx.type === "expense" || !tx.type)).reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);

  const data = [
    { name: 'Income', value: income },
    { name: 'Expenses', value: expense },
  ];

  const COLORS = ['#10b981', '#ef4444'];

  if (income === 0 && expense === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        <p>No transaction data available for chart</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent, value }) => `${name}: ${(percent * 100).toFixed(1)}% (₱${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => `₱${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px',
            padding: '8px'
          }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

