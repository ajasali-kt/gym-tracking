import { useMemo } from 'react';
import SetRow from './SetRow';

function ExerciseCard({
  exercise,
  sets,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
  suggestion,
  showSavedGlow,
  showPrBadge
}) {
  const totalVolume = useMemo(
    () => sets.reduce((sum, set) => sum + ((Number.parseFloat(set.weightKg) || 0) * (Number.parseInt(set.repsCompleted, 10) || 0)), 0),
    [sets]
  );

  return (
    <section className={`card p-4 sm:p-5 transition ${showSavedGlow ? 'save-glow' : ''}`}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-app-primary">{exercise.name}</h3>
            {showPrBadge && <span className="badge-success">New PR</span>}
          </div>
          <p className="mt-1 text-xs text-app-muted">{exercise.muscleGroup?.name || 'General'}</p>
          {suggestion && (
            <p className="mt-2 text-xs text-blue-300">
              Last time: {suggestion.weightKg}kg x {suggestion.repsCompleted}
            </p>
          )}
        </div>

        <div className="text-right">
          <p className="text-xs text-app-muted">Total sets: {sets.length}</p>
          <p className="mt-1 text-sm font-semibold text-app-primary">Volume: {Math.round(totalVolume)} kg</p>
          <button
            id={`log-exercise-${exercise.id}-remove-button`}
            type="button"
            onClick={onRemoveExercise}
            className="mt-2 rounded-lg border border-red-500/40 px-2 py-1 text-xs text-red-300 transition hover:bg-red-500/10"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2 px-2 pb-2 text-[11px] uppercase tracking-[0.1em] text-app-muted sm:text-xs">
        <div className="col-span-1 sm:col-span-2">Set</div>
        <div className="col-span-3 sm:col-span-2">Reps</div>
        <div className="col-span-3 sm:col-span-2">Weight</div>
        <div className="col-span-3 sm:col-span-4">Notes (Optional)</div>
        <div className="col-span-2 sm:col-span-2 text-right">Actions</div>
      </div>

      <div className="space-y-2">
        {sets.map((set, setIndex) => (
          <SetRow
            key={`${exercise.id}-${set.setNumber}-${set.id || setIndex}`}
            set={set}
            setIndex={setIndex}
            idPrefix={`log-exercise-${exercise.id}-set-${set.id ?? `${set.setNumber}-${setIndex}`}`}
            onUpdate={onUpdateSet}
            onRemove={() => onRemoveSet(setIndex)}
            showRemove={sets.length > 1}
          />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <button id={`log-exercise-${exercise.id}-add-set-button`} type="button" onClick={onAddSet} className="btn-outline">+ Add Set</button>
      </div>
    </section>
  );
}

export default ExerciseCard;
