import { useState } from 'react';
import { format } from 'date-fns';

function getWorkoutVolume(workout) {
  return workout.exercises.reduce((sum, exercise) => {
    return sum + exercise.sets.reduce((setSum, set) => setSum + ((set.reps || 0) * (set.weight || 0)), 0);
  }, 0);
}

function TimelineItem({ workout }) {
  const [open, setOpen] = useState(false);
  const volume = getWorkoutVolume(workout);

  return (
    <div className="timeline-item">
      <div className="timeline-dot" />
      <div className="card p-4 sm:p-5">
        <button onClick={() => setOpen((v) => !v)} className="w-full text-left">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs text-app-muted">{format(new Date(workout.date), 'EEE, MMM d, yyyy')}</p>
              <h4 className="mt-1 text-lg font-semibold text-app-primary">{workout.workoutName}</h4>
              <p className="text-xs text-app-muted">{workout.exercises.length} exercises</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-app-muted">Volume</p>
              <p className="text-base font-semibold text-app-primary">{Math.round(volume)} kg</p>
            </div>
          </div>
        </button>

        <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-[900px] pt-4' : 'max-h-0'}`}>
          <div className="space-y-3">
            {workout.exercises.map((exercise) => (
              <div key={`${workout.date}-${exercise.exerciseId}`} className="rounded-xl border border-app-subtle bg-surface p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-app-primary">{exercise.exerciseName}</p>
                  <p className="text-xs text-app-muted">{exercise.muscleGroup}</p>
                </div>
                <div className="mt-2 space-y-1 text-sm text-app-muted">
                  {exercise.sets.map((set) => (
                    <p key={`${exercise.exerciseId}-${set.setNumber}`}>
                      Set {set.setNumber}: <span className="text-app-primary">{set.reps} reps x {set.weight} kg</span>
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimelineItem;
