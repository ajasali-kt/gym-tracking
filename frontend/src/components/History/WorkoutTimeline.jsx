import TimelineItem from './TimelineItem';

const WorkoutTimeline = ({ data }) => {
  if (!data || !data.workouts || data.workouts.length === 0) {
    return (
      <div className="card p-4 sm:p-8 text-center">
        <p className="text-app-muted">No workouts found for this date range</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="card p-4">
        <h2 className="mb-4 text-xl font-semibold text-app-primary">Summary</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-blue-500/25 bg-blue-500/10 p-4">
            <p className="text-sm font-medium text-blue-300">Total Workouts</p>
            <p className="text-2xl font-bold text-app-primary">{data.totalWorkouts}</p>
          </div>
          <div className="rounded-lg border border-green-500/25 bg-green-500/10 p-4">
            <p className="text-sm font-medium text-green-300">Total Sets</p>
            <p className="text-2xl font-bold text-app-primary">{data.totalSets}</p>
          </div>
          <div className="rounded-lg border border-blue-400/20 bg-blue-400/10 p-4">
            <p className="text-sm font-medium text-blue-200">Total Volume</p>
            <p className="text-2xl font-bold text-app-primary">{data.totalVolume.toLocaleString()} kg</p>
          </div>
        </div>

        {data.volumeByMuscleGroup && Object.keys(data.volumeByMuscleGroup).length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-medium text-app-muted">Volume by Muscle Group</h3>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {Object.entries(data.volumeByMuscleGroup).map(([muscleGroup, volume]) => (
                <div key={muscleGroup} className="rounded-lg border border-app-subtle bg-surface p-3">
                  <p className="text-xs text-app-muted">{muscleGroup}</p>
                  <p className="text-lg font-bold text-app-primary">{Math.round(volume)} kg</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-app-primary">Recent Workouts</h2>
          <p className="text-xs text-app-muted">{data.workouts.length} sessions</p>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {data.workouts.map((workout, workoutIndex) => (
            <TimelineItem
              key={`${workout.date}-${workoutIndex}`}
              workout={workout}
              defaultOpen
              collapsible={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkoutTimeline;
