import { getInvalidInputClass, isValidPositiveInteger } from '../../utils/inputValidation';

function SetRow({ set, setIndex, onUpdate, onRemove, showRemove, idPrefix, metricType = 'STRENGTH' }) {
  const isRepsInvalid = !!set.repsCompleted && !isValidPositiveInteger(set.repsCompleted);
  const resolvedIdPrefix = idPrefix || `log-set-${set.id ?? set.setNumber ?? setIndex}`;
  const isRunning = metricType === 'RUNNING';

  return (
    <div className="group grid grid-cols-12 gap-2 rounded-xl border border-app-subtle bg-surface px-2 py-2 transition hover:border-blue-500/40">
      <div className="col-span-1 sm:col-span-2 flex items-center text-xs sm:text-sm text-app-muted whitespace-nowrap">
        <span>{isRunning ? 'Run' : `Set ${set.setNumber}`}</span>
      </div>
      {isRunning ? (
        <>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={set.distanceKm || ''}
            onChange={(e) => onUpdate(setIndex, 'distanceKm', e.target.value)}
            placeholder="Km"
            inputMode="decimal"
            className="col-span-3 sm:col-span-2 input-field text-sm !px-2 !py-2"
          />
          <input
            type="number"
            min="1"
            step="0.5"
            value={set.durationMinutes || ''}
            onChange={(e) => onUpdate(setIndex, 'durationMinutes', e.target.value)}
            placeholder="Min"
            inputMode="decimal"
            className="col-span-3 sm:col-span-2 input-field text-sm !px-2 !py-2"
          />
          <input
            type="text"
            value={set.notes}
            onChange={(e) => onUpdate(setIndex, 'notes', e.target.value)}
            placeholder="Optional"
            className="col-span-3 sm:col-span-4 input-field text-sm !px-2 !py-2"
          />
        </>
      ) : (
        <>
      <input
        type="number"
        min="1"
        step="1"
        value={set.repsCompleted}
        onChange={(e) => onUpdate(setIndex, 'repsCompleted', e.target.value)}
        placeholder="Reps"
        inputMode="numeric"
        className={`col-span-3 sm:col-span-2 input-field text-sm !px-2 !py-2 ${getInvalidInputClass(isRepsInvalid)}`}
      />
      <input
        type="number"
        min="1"
        value={set.weightKg}
        onChange={(e) => onUpdate(setIndex, 'weightKg', e.target.value)}
        placeholder="Kg"
        inputMode="decimal"
        className="col-span-3 sm:col-span-2 input-field text-sm !px-2 !py-2"
      />
      <input
        type="text"
        value={set.notes}
        onChange={(e) => onUpdate(setIndex, 'notes', e.target.value)}
        placeholder="Optional"
        className="col-span-3 sm:col-span-4 input-field text-sm !px-2 !py-2"
      />
        </>
      )}
      <div className="col-span-2 sm:col-span-2 flex items-center justify-end">
        {showRemove && !isRunning && (
          <button
            id={`${resolvedIdPrefix}-delete-button`}
            type="button"
            onClick={onRemove}
            className="rounded-lg border border-red-500/40 px-2 py-1 text-xs text-red-300 transition hover:bg-red-500/10"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default SetRow;
