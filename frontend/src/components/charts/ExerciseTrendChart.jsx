import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function ExerciseTrendChart({ data, metric, onMetricChange }) {
  const colors = {
    weight: '#3B82F6',
    volume: '#10B981',
    reps: '#F59E0B'
  };

  return (
    <div className="card p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-app-primary">Exercise Performance</h3>
        <div className="segmented-control">
          {['weight', 'volume', 'reps'].map((option) => (
            <button
              key={option}
              onClick={() => onMetricChange(option)}
              className={`segment-btn ${metric === option ? 'segment-btn-active' : ''}`}
            >
              {option[0].toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 14, left: 0, bottom: 8 }}>
            <CartesianGrid stroke="#2A2A33" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
            <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
            <Tooltip
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
              dataKey={metric}
              stroke={colors[metric]}
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

export default ExerciseTrendChart;
