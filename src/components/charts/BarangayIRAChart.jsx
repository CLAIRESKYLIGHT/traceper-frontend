import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function BarangayIRAChart({ barangays }) {
  // Sort by IRA share and take top 10
  const sortedBarangays = [...barangays]
    .sort((a, b) => (b.ira_share || 0) - (a.ira_share || 0))
    .slice(0, 10);

  const data = sortedBarangays.map((b) => ({
    name: b.barangay_name?.length > 15 ? b.barangay_name.substring(0, 15) + '...' : b.barangay_name,
    fullName: b.barangay_name,
    amount: b.ira_share || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart 
        data={data} 
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        layout="vertical"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          type="number"
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          tickFormatter={(value) => `₱${(value / 1000000).toFixed(1)}M`}
        />
        <YAxis 
          type="category"
          dataKey="name"
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          width={120}
        />
        <Tooltip 
          formatter={(value, name, props) => [
            `₱${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            props.payload.fullName
          ]}
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px',
            padding: '8px'
          }}
        />
        <Bar 
          dataKey="amount" 
          fill="#3b82f6" 
          radius={[0, 8, 8, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

