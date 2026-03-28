import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import exerciseService from '../../services/exerciseService';
import progressService from '../../services/progressService';
import useAccessibleModal from '../../hooks/useAccessibleModal';
import ExerciseCard from '../log/ExerciseCard';
import { isValidPositiveInteger } from '../../utils/inputValidation';

function SaveIndicator({ status }) {
  if (status === 'saving') return <span className="text-xs text-warning">Saving</span>;
  if (status === 'saved') return <span className="text-xs text-success">Saved</span>;
  if (status === 'error') return <span className="text-xs text-error">Error</span>;
  return <span className="text-xs text-app-muted">Idle</span>;
}

function ManualWorkoutLog() {
  const AUTO_SAVE_DEBOUNCE_MS = 800;
  const navigate = useNavigate();
  const location = useLocation();
  const { workoutId } = useParams();
  const isEditMode = !!workoutId;

  const [exercises, setExercises] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [workoutDate, setWorkoutDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [workoutName, setWorkoutName] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [workoutLogId, setWorkoutLogId] = useState(workoutId ? Number.parseInt(workoutId, 10) : null);
  const [exerciseLogs, setExerciseLogs] = useState({});
  const [exerciseMeta, setExerciseMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [pendingChanges, setPendingChanges] = useState(false);
  const [error, setError] = useState(null);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [savePulse, setSavePulse] = useState(false);

  const autosaveTimerRef = useRef(null);
  const isSyncInFlightRef = useRef(false);
  const hasQueuedSyncRef = useRef(false);
  const pendingChangesRef = useRef(false);

  const toDateInputValue = (dateValue) => {
    if (!dateValue) return format(new Date(), 'yyyy-MM-dd');
    if (typeof dateValue === 'string' && dateValue.includes('T')) return dateValue.split('T')[0];

    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return format(new Date(), 'yyyy-MM-dd');

    const year = parsed.getUTCFullYear();
    const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
    const day = String(parsed.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    fetchData();
  }, [workoutId]);

  useEffect(() => {
    pendingChangesRef.current = pendingChanges;
  }, [pendingChanges]);

  useEffect(() => {
    if (saveStatus !== 'saved') return;
    setSavePulse(true);
    const t = setTimeout(() => setSavePulse(false), 700);
    return () => clearTimeout(t);
  }, [saveStatus]);

  useEffect(() => () => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      setPendingChanges(false);
      setSaveStatus('idle');
      setLastSavedAt(null);
      setWorkoutLogId(workoutId ? Number.parseInt(workoutId, 10) : null);

      const exercisesData = await exerciseService.getAllExercises();
      setExercises(exercisesData);

      if (isEditMode) {
        const workoutData = await progressService.getWorkoutLog(workoutId);

        setWorkoutName(workoutData.workoutName || workoutData.workoutDay?.dayName || '');
        setWorkoutDate(toDateInputValue(workoutData.completedDate));
        setWorkoutNotes(workoutData.notes || '');

        const groupedLogs = {};
        const uniqueExercises = [];
        const exerciseMap = {};

        (workoutData.exerciseLogs || []).forEach((log) => {
          const exerciseId = log.exercise.id;
          if (!exerciseMap[exerciseId]) {
            exerciseMap[exerciseId] = log.exercise;
            uniqueExercises.push(log.exercise);
          }

          if (!groupedLogs[exerciseId]) groupedLogs[exerciseId] = [];
          groupedLogs[exerciseId].push({
            id: log.id,
            setNumber: log.setNumber,
            repsCompleted: String(log.repsCompleted),
            weightKg: String(log.weightKg),
            notes: log.notes || ''
          });
        });

        setSelectedExercises(uniqueExercises);
        setExerciseLogs(groupedLogs);

      } else {
        setSelectedExercises([]);
        setExerciseLogs({});
        setWorkoutName('');
        setWorkoutNotes('');
        setWorkoutDate(format(new Date(), 'yyyy-MM-dd'));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load workout');
    } finally {
      setLoading(false);
    }
  };

  const fetchExerciseMeta = async (exercise) => {
    try {
      const response = await progressService.getExerciseProgress(exercise.id, { limit: 1 });
      const logs = response?.logs || [];
      const lastLog = logs[0] || null;
      const maxWeight = Math.max(0, ...(response?.logs || []).map((log) => Number.parseFloat(log.weightKg) || 0));

      setExerciseMeta((prev) => ({
        ...prev,
        [exercise.id]: {
          suggestion: lastLog ? { weightKg: lastLog.weightKg, repsCompleted: lastLog.repsCompleted } : null,
          maxWeight
        }
      }));
    } catch {
      setExerciseMeta((prev) => ({ ...prev, [exercise.id]: { suggestion: null, maxWeight: 0 } }));
    }
  };

  const markDirty = () => {
    setPendingChanges(true);
    setSaveStatus((previous) => (previous === 'error' ? 'error' : 'idle'));
  };

  const handleAddExercise = async (exercise) => {
    if (selectedExercises.find((ex) => ex.id === exercise.id)) {
      alert('Exercise already added');
      return;
    }

    setSelectedExercises((prev) => [...prev, exercise]);
    setExerciseLogs((prev) => ({
      ...prev,
      [exercise.id]: Array.from({ length: 3 }, (_, i) => ({
        id: null,
        setNumber: i + 1,
        repsCompleted: '',
        weightKg: '',
        notes: ''
      }))
    }));

    setShowExercisePicker(false);
    markDirty();
    fetchExerciseMeta(exercise);
  };

  const handleRemoveExercise = (exerciseId) => {
    setSelectedExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
    setExerciseLogs((prev) => {
      const next = { ...prev };
      delete next[exerciseId];
      return next;
    });
    markDirty();
  };

  const handleUpdateSet = (exerciseId, setIndex, field, value) => {
    setExerciseLogs((prev) => {
      const next = { ...prev };
      next[exerciseId][setIndex][field] = value;
      return next;
    });
    markDirty();
  };

  const handleAddSet = (exerciseId) => {
    setExerciseLogs((prev) => {
      const next = { ...prev };
      const currentSets = next[exerciseId] || [];
      next[exerciseId] = [
        ...currentSets,
        {
          id: null,
          setNumber: currentSets.length + 1,
          repsCompleted: '',
          weightKg: '',
          notes: ''
        }
      ];
      return next;
    });
    markDirty();
  };

  const handleRemoveSet = (exerciseId, setIndex) => {
    setExerciseLogs((prev) => {
      const next = { ...prev };
      next[exerciseId] = (next[exerciseId] || [])
        .filter((_, index) => index !== setIndex)
        .map((set, index) => ({ ...set, setNumber: index + 1 }));
      return next;
    });
    markDirty();
  };

  const buildSyncPayload = () => {
    if (!workoutName.trim() || !workoutDate) return null;

    let hasInvalidExistingSet = false;
    const validSets = [];

    for (const exercise of selectedExercises) {
      const sets = exerciseLogs[exercise.id] || [];
      for (const set of sets) {
        const repsValid = isValidPositiveInteger(set.repsCompleted);
        const repsCompleted = repsValid ? Number.parseInt(set.repsCompleted, 10) : null;
        const weightKg = Number.parseFloat(set.weightKg);
        const hasExistingId = set.id !== undefined && set.id !== null;
        const weightValid = Number.isFinite(weightKg) && weightKg > 0;

        if (hasExistingId && (!repsValid || !weightValid)) {
          hasInvalidExistingSet = true;
          continue;
        }

        if (repsValid && weightValid) {
          validSets.push({
            id: set.id || undefined,
            exerciseId: exercise.id,
            setNumber: set.setNumber,
            repsCompleted,
            weightKg,
            notes: set.notes || null
          });
        }
      }
    }

    if (hasInvalidExistingSet) return null;
    if (validSets.length === 0 && !workoutLogId) return null;

    return {
      workoutLogId: workoutLogId || undefined,
      workoutName: workoutName.trim(),
      completedDate: workoutDate,
      notes: workoutNotes || null,
      sets: validSets
    };
  };

  const applyCanonicalSetIds = (currentLogs, canonicalSets) => {
    const canonicalByExerciseSet = new Map();
    canonicalSets.forEach((set) => {
      canonicalByExerciseSet.set(`${set.exerciseId}-${set.setNumber}`, set.id);
    });

    const updated = {};
    for (const [exerciseId, sets] of Object.entries(currentLogs)) {
      updated[exerciseId] = sets.map((set) => ({
        ...set,
        id: canonicalByExerciseSet.get(`${Number.parseInt(exerciseId, 10)}-${set.setNumber}`) || null
      }));
    }
    return updated;
  };

  const logWorkout = async () => {
    if (isSyncInFlightRef.current) {
      hasQueuedSyncRef.current = true;
      return false;
    }

    const payload = buildSyncPayload();
    if (!payload) return true;

    isSyncInFlightRef.current = true;
    setSaveStatus('saving');
    setError(null);

    try {
      const response = await progressService.logWorkout(payload);
      if (response.workoutLogId && !workoutLogId) setWorkoutLogId(response.workoutLogId);

      setExerciseLogs((previous) => applyCanonicalSetIds(previous, response.exerciseLogs || []));
      setPendingChanges(false);
      setSaveStatus('saved');
      setLastSavedAt(response.savedAt || new Date().toISOString());

      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Autosave failed. Your changes are still visible.';
      setSaveStatus('error');
      setError(message);
      return false;
    } finally {
      isSyncInFlightRef.current = false;
      if (hasQueuedSyncRef.current && pendingChangesRef.current) {
        hasQueuedSyncRef.current = false;
        logWorkout();
      }
    }
  };

  useEffect(() => {
    if (!pendingChanges) return undefined;

    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      logWorkout();
    }, AUTO_SAVE_DEBOUNCE_MS);

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [pendingChanges, workoutName, workoutDate, workoutNotes, selectedExercises, exerciseLogs, workoutLogId]);

  const handleDeleteWorkout = async () => {
    if (!workoutLogId) return;
    if (!confirm('Delete this workout? This cannot be undone.')) return;

    try {
      await progressService.deleteWorkoutLog(workoutLogId);
      navigate('/progress');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete workout');
    }
  };

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
      return;
    }

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/');
  };

  const pageVolume = useMemo(() => {
    return Object.values(exerciseLogs).flat().reduce((sum, set) => {
      const reps = Number.parseInt(set.repsCompleted, 10) || 0;
      const weight = Number.parseFloat(set.weightKg) || 0;
      return sum + reps * weight;
    }, 0);
  }, [exerciseLogs]);
  const hasWorkoutNotes = workoutNotes.trim().length > 0;

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="card h-24 bg-surface" />
        <div className="card h-56 bg-surface" />
        <div className="card h-80 bg-surface" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        <header className="card p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-app-muted">Live Logging</p>
              <h1 className="text-2xl font-bold text-app-primary">{isEditMode ? 'Edit Workout' : 'Manual Workout Log'}</h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <SaveIndicator status={saveStatus} />
              {lastSavedAt && <span className="text-xs text-app-muted">{format(new Date(lastSavedAt), 'p')}</span>}
              {workoutLogId && (
                <button
                  type="button"
                  id="manual-workout-delete-button"
                  onClick={handleDeleteWorkout}
                  className="btn-outline border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/15"
                >
                  Delete
                </button>
              )}
              <button
                id="manual-workout-back-button"
                onClick={handleBack}
                className="w-full sm:w-auto px-4 py-2 btn-secondary transition"
              >
                Back
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="label">Workout Name</label>
              <input
                type="text"
                value={workoutName}
                onChange={(e) => {
                  setWorkoutName(e.target.value);
                  markDirty();
                }}
                placeholder="e.g. Push Session"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                value={workoutDate}
                max={format(new Date(), 'yyyy-MM-dd')}
                onChange={(e) => {
                  setWorkoutDate(e.target.value);
                  markDirty();
                }}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Total Volume</label>
              <div className="input-field flex items-center">{Math.round(pageVolume).toLocaleString()} kg</div>
            </div>
          </div>

          <div className="mt-3">
            <label className="label">Workout Notes</label>
            <textarea
              value={workoutNotes}
              rows={2}
              onChange={(e) => {
                setWorkoutNotes(e.target.value);
                markDirty();
              }}
              placeholder="How did it feel today?"
              className={`input-field transition ${hasWorkoutNotes ? 'border-blue-500/60' : ''}`}
            />
          </div>

          {error && (
            <div className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}
        </header>

        {selectedExercises.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-app-muted">No exercises added yet.</p>
            <button
              type="button"
              id="manual-workout-empty-add-exercise-button"
              className="btn-outline mt-4 border-green-500/40 bg-green-500/10 text-green-300 hover:bg-green-500/15"
              onClick={() => setShowExercisePicker(true)}
            >
              Add Exercise
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedExercises.map((exercise) => {
              const sets = exerciseLogs[exercise.id] || [];
              const localMaxWeight = Math.max(0, ...sets.map((set) => Number.parseFloat(set.weightKg) || 0));
              const previousMax = exerciseMeta[exercise.id]?.maxWeight || 0;
              const showPrBadge = previousMax > 0 && localMaxWeight > previousMax;

              return (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  sets={sets}
                  onUpdateSet={(setIndex, field, value) => handleUpdateSet(exercise.id, setIndex, field, value)}
                  onAddSet={() => handleAddSet(exercise.id)}
                  onRemoveSet={(setIndex) => handleRemoveSet(exercise.id, setIndex)}
                  onRemoveExercise={() => handleRemoveExercise(exercise.id)}
                  suggestion={exerciseMeta[exercise.id]?.suggestion || null}
                  showSavedGlow={savePulse}
                  showPrBadge={showPrBadge}
                />
              );
            })}
          </div>
        )}
      </div>

      <button
        id="manual-workout-fab-add-exercise-button"
        onClick={() => setShowExercisePicker(true)}
        className="fab-button"
        aria-label="Add exercise"
      >
        +
      </button>

      {showExercisePicker && (
        <ExercisePickerModal
          exercises={exercises}
          onSelect={handleAddExercise}
          onClose={() => setShowExercisePicker(false)}
        />
      )}
    </>
  );
}

function ExercisePickerModal({ exercises, onSelect, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);
  const searchInputRef = useRef(null);
  useAccessibleModal({ isOpen: true, onClose, modalRef, initialFocusRef: searchInputRef });

  const filteredExercises = exercises.filter((exercise) =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
    || exercise.muscleGroup?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3" onClick={onClose}>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="w-full max-w-2xl rounded-2xl border border-app-subtle bg-card shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-app-subtle px-5 py-4">
          <h2 className="text-xl font-semibold text-app-primary">Add Exercise</h2>
          <button
            ref={closeBtnRef}
            id="manual-workout-exercise-picker-close-button"
            type="button"
            onClick={onClose}
            className="text-app-muted hover:text-app-primary"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5">
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search exercises"
            className="input-field mb-3"
          />

          <div className="space-y-2">
            {filteredExercises.map((exercise) => (
              <button
                key={exercise.id}
                id={`manual-workout-exercise-picker-select-${exercise.id}-button`}
                onClick={() => onSelect(exercise)}
                className="w-full rounded-xl border border-app-subtle bg-surface p-3 text-left transition hover:border-blue-500/50"
              >
                <p className="font-medium text-app-primary">{exercise.name}</p>
                <p className="text-xs text-app-muted">{exercise.muscleGroup?.name}</p>
              </button>
            ))}
            {filteredExercises.length === 0 && (
              <p className="py-8 text-center text-sm text-app-muted">No exercises found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManualWorkoutLog;
