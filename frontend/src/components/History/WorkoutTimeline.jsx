const WorkoutTimeline = ({ data }) => {
  if (!data || !data.workouts || data.workouts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-500">No workouts found for this date range</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium">Total Workouts</p>
            <p className="text-2xl font-bold text-blue-900">{data.totalWorkouts}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium">Total Sets</p>
            <p className="text-2xl font-bold text-green-900">{data.totalSets}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-600 font-medium">Total Volume</p>
            <p className="text-2xl font-bold text-purple-900">{data.totalVolume.toLocaleString()} kg</p>
          </div>
        </div>

        {/* Volume by Muscle Group */}
        {data.volumeByMuscleGroup && Object.keys(data.volumeByMuscleGroup).length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Volume by Muscle Group</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(data.volumeByMuscleGroup).map(([muscleGroup, volume]) => (
                <div key={muscleGroup} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">{muscleGroup}</p>
                  <p className="text-lg font-bold text-gray-900">{Math.round(volume)} kg</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Workout Timeline</h2>
        {data.workouts.map((workout, workoutIndex) => (
          <div key={workoutIndex} className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Workout Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100">{formatDate(workout.date)}</p>
                  <h3 className="text-xl font-bold text-white">{workout.workoutName}</h3>
                </div>
                <div className="bg-blue-400 bg-opacity-50 px-3 py-1 rounded-full">
                  <p className="text-sm font-medium text-white">{workout.muscleGroup}</p>
                </div>
              </div>
              {workout.notes && (
                <p className="mt-2 text-sm text-blue-100">{workout.notes}</p>
              )}
            </div>

            {/* Exercises */}
            <div className="p-6 space-y-4">
              {workout.exercises.map((exercise, exerciseIndex) => (
                <div key={exerciseIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">{exercise.exerciseName}</h4>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {exercise.muscleGroup}
                    </span>
                  </div>

                  {/* Sets */}
                  <div className="space-y-2">
                    {exercise.sets.map((set, setIndex) => (
                      <div
                        key={setIndex}
                        className="flex items-center justify-between bg-gray-50 rounded px-4 py-2"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          Set {set.setNumber}
                        </span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-900">
                            <span className="font-semibold">{set.reps}</span> reps
                          </span>
                          <span className="text-sm text-gray-900">
                            <span className="font-semibold">{set.weight}</span> kg
                          </span>
                          <span className="text-sm text-gray-500">
                            ({set.reps * set.weight} kg volume)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutTimeline;
