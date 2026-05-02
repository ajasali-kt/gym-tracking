import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function BodyWeightChart({ data }) {
  return (
    <div className="card p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-app-primary">Body Weight Trend</h3>
        <span className="rounded-md border border-blue-500/35 bg-blue-500/15 px-2 py-1 text-xs font-medium text-blue-200">
          kg
        </span>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 14, left: 0, bottom: 8 }}>
            <CartesianGrid stroke="#2A2A33" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
            <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} domain={['dataMin - 2', 'dataMax + 2']} />
            <Tooltip
              formatter={(value) => [`${value} kg`, 'Weight']}
              contentStyle={{
                background: '#17171C',
                border: '1px solid #2A2A33',
                borderRadius: 12,
                color: '#FFF'
              }}
              cursor={{ stroke: '#2A2A33' }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#3B82F6"
              strokeWidth={2.5}
              dot={{ r: 2 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default BodyWeightChart;
