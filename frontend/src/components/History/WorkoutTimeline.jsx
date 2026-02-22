const WorkoutTimeline = ({ data }) => {
  if (!data || !data.workouts || data.workouts.length === 0) {
    return (
      <div className="card p-4 sm:p-8 text-center">
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
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="card p-4">
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
          <div key={workoutIndex} className="card overflow-hidden">
            {/* Workout Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-blue-100">{formatDate(workout.date)}</p>
                  <h3 className="text-lg font-bold text-white sm:text-xl break-words">{workout.workoutName}</h3>
                </div>
                <div className="inline-flex w-fit bg-blue-400 bg-opacity-50 px-3 py-1 rounded-full">
                  <p className="text-sm font-medium text-white">{workout.muscleGroup}</p>
                </div>
              </div>
              {workout.notes && (
                <p className="mt-2 text-sm text-blue-100">{workout.notes}</p>
              )}
            </div>

            {/* Exercises */}
            <div className="p-4 space-y-4 sm:p-6">
              {workout.exercises.map((exercise, exerciseIndex) => (
                <div key={exerciseIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-col gap-2 mb-3 sm:flex-row sm:items-center sm:justify-between">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 break-words">{exercise.exerciseName}</h4>
                    <span className="inline-flex w-fit text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {exercise.muscleGroup}
                    </span>
                  </div>

                  {/* Sets */}
                  <div className="space-y-2">
                    {exercise.sets.map((set, setIndex) => (
                      <div
                        key={setIndex}
                        className="bg-gray-50 rounded px-3 py-3 sm:px-4 sm:py-2"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            Set {set.setNumber}
                          </span>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:flex sm:items-center sm:gap-4">
                            <span className="text-gray-900">
                              <span className="font-semibold">{set.reps}</span> reps
                            </span>
                            <span className="text-gray-900">
                              <span className="font-semibold">{set.weight}</span> kg
                            </span>
                            <span className="col-span-2 text-xs sm:text-sm text-gray-500">
                              {set.reps * set.weight} kg volume
                            </span>
                          </div>
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

