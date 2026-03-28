import { useState } from 'react';
import { format } from 'date-fns';

function getWorkoutVolume(workout) {
  return workout.exercises.reduce((sum, exercise) => {
    return sum + exercise.sets.reduce((setSum, set) => setSum + ((set.reps || 0) * (set.weight || 0)), 0);
  }, 0);
}

function TimelineItem({
  workout,
  defaultOpen = false,
  collapsible = true
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isOpen = collapsible ? open : true;
  const volume = getWorkoutVolume(workout);
  const exerciseCount = workout.exercises.length;
  const workoutIdSafe = String(workout.id ?? workout.workoutLogId ?? workout.date).replace(/[^a-zA-Z0-9]+/g, '-');

  return (
    <article className="card p-4 transition duration-200 hover:-translate-y-0.5 hover:border-blue-500/50">
      {collapsible ? (
        <button
          id={`timeline-item-${workoutIdSafe}-toggle-button`}
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full text-left"
          aria-expanded={isOpen}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs text-app-muted">{format(new Date(workout.date), 'EEEE, MMM d')}</p>
              <h3 className="mt-1 text-lg font-semibold text-app-primary">{workout.workoutName}</h3>
              <p className="text-sm text-app-muted">{exerciseCount} exercises</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-app-muted">Volume</p>
                <p className="text-base font-semibold text-app-primary">{Math.round(volume)} kg</p>
              </div>
              <svg
                className={`h-5 w-5 text-app-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.167l3.71-3.936a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </button>
      ) : (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-app-muted">{format(new Date(workout.date), 'EEEE, MMM d')}</p>
            <h3 className="mt-1 text-lg font-semibold text-app-primary">{workout.workoutName}</h3>
            <p className="text-sm text-app-muted">{exerciseCount} exercises</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-app-muted">Volume</p>
            <p className="text-base font-semibold text-app-primary">{Math.round(volume)} kg</p>
          </div>
        </div>
      )}

      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[1200px] pt-3' : 'max-h-0'}`}>
        <div className="space-y-3">
          {workout.exercises.map((exercise) => (
            <div key={`${workout.date}-${exercise.exerciseId}`} className="space-y-2">
               <div className="flex items-center justify-between">
                 <p className="text-sm font-semibold text-app-primary">{exercise.exerciseName}</p>
                 <p className="text-sm  text-app-muted">{exercise.muscleGroup}</p>
               </div>
              <div className="space-y-2">
                {exercise.sets
                  .sort((a, b) => (a.setNumber || 0) - (b.setNumber || 0))
                  .map((set) => (
                    <div key={`${exercise.exerciseId}-${set.setNumber}`} className="rounded-lg border border-app-subtle bg-surface px-3 py-2 text-sm text-app-primary">
                      <div className="grid grid-cols-4 gap-2">
                        <span>Set {set.setNumber || '-'}</span>
                        <span>{set.reps || '-'} reps</span>
                        <span>{set.weight || '-'} kg</span>
                        <span>{set.weight && set.reps ? `${Math.round(set.weight * set.reps)} vol` : '-'}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export default TimelineItem;
