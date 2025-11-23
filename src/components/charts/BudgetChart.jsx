import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function BudgetChart({ allocated, spent, remaining }) {
  const data = [
    {
      name: 'Budget',
      Allocated: allocated || 0,
      Spent: spent || 0,
      Remaining: remaining || 0,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="name" 
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
        <Bar dataKey="Allocated" fill="#6366f1" radius={[8, 8, 0, 0]} />
        <Bar dataKey="Spent" fill="#f59e0b" radius={[8, 8, 0, 0]} />
        <Bar dataKey="Remaining" fill="#10b981" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

