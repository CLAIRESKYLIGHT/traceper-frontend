import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function ProjectStatusChart({ projects }) {
  const statusCounts = projects.reduce((acc, project) => {
    const status = project.status || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = {
    'Completed': '#10b981',
    'In Progress': '#3b82f6',
    'Not Started': '#6b7280',
    'Delayed': '#f59e0b',
    'Cancelled': '#ef4444',
    'Unknown': '#9ca3af'
  };

  const getColor = (name) => COLORS[name] || '#9ca3af';

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => `${value} project${value !== 1 ? 's' : ''}`}
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
          formatter={(value) => value}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

