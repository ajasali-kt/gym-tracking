function SetRow({ set, setIndex, onUpdate, onRemove, showRemove }) {
  return (
    <div className="group grid grid-cols-12 gap-2 rounded-xl border border-app-subtle bg-surface px-2 py-2 transition hover:border-blue-500/40">
      <div className="col-span-1 sm:col-span-2 flex items-center text-xs sm:text-sm text-app-muted whitespace-nowrap">
        <span className="sm:hidden">S{set.setNumber}</span>
        <span className="hidden sm:inline">Set {set.setNumber}</span>
      </div>
      <input
        type="number"
        min="1"
        value={set.repsCompleted}
        onChange={(e) => onUpdate(setIndex, 'repsCompleted', e.target.value)}
        placeholder="Reps"
        className="col-span-3 sm:col-span-2 input-field text-sm !px-2 !py-2"
      />
      <input
        type="number"
        min="0"
        step="0.5"
        value={set.weightKg}
        onChange={(e) => onUpdate(setIndex, 'weightKg', e.target.value)}
        placeholder="Kg"
        className="col-span-3 sm:col-span-2 input-field text-sm !px-2 !py-2"
      />
      <input
        type="text"
        value={set.notes}
        onChange={(e) => onUpdate(setIndex, 'notes', e.target.value)}
        placeholder="Optional"
        className="col-span-3 sm:col-span-4 input-field text-sm !px-2 !py-2"
      />
      <div className="col-span-2 sm:col-span-2 flex items-center justify-end">
        {showRemove && (
          <button
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
