import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import exerciseService from '../../services/exerciseService';
import progressService from '../../services/progressService';
import useAccessibleModal from '../../hooks/useAccessibleModal';

/**
 * Manual Workout Log Component
 * Allows users to manually log workouts without a predefined workout plan
 * Supports both creating new workouts and editing existing ones
 */
function ManualWorkoutLog() {
  const AUTO_SAVE_DEBOUNCE_MS = 800;
  const navigate = useNavigate();
  const { workoutId } = useParams(); // If present, we're in edit mode
  const isEditMode = !!workoutId;

  const [exercises, setExercises] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [workoutDate, setWorkoutDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [workoutName, setWorkoutName] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [workoutLogId, setWorkoutLogId] = useState(workoutId ? Number.parseInt(workoutId, 10) : null);
  const [exerciseLogs, setExerciseLogs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved | error
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [pendingChanges, setPendingChanges] = useState(false);
  const [error, setError] = useState(null);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [originalWorkout, setOriginalWorkout] = useState(null);
  const autosaveTimerRef = useRef(null);
  const isSyncInFlightRef = useRef(false);
  const hasQueuedSyncRef = useRef(false);
  const pendingChangesRef = useRef(false);

  useEffect(() => {
    fetchData();
  }, [workoutId]);

  useEffect(() => {
    pendingChangesRef.current = pendingChanges;
  }, [pendingChanges]);

  useEffect(() => () => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      setPendingChanges(false);
      setSaveStatus('idle');
      setLastSavedAt(null);
      setWorkoutLogId(workoutId ? Number.parseInt(workoutId, 10) : null);

      if (isEditMode) {
        // Edit mode: fetch both exercises and existing workout data
        const [exercisesData, workoutData] = await Promise.all([
          exerciseService.getAllExercises(),
          progressService.getWorkoutLog(workoutId)
        ]);

        setExercises(exercisesData);
        setOriginalWorkout(workoutData);

        // Populate form with existing data
        setWorkoutName(workoutData.workoutName || workoutData.workoutDay?.dayName || '');
        setWorkoutDate(format(parseISO(workoutData.completedDate), 'yyyy-MM-dd'));
        setWorkoutNotes(workoutData.notes || '');

        // Group exercise logs by exercise
        const groupedLogs = {};
        const uniqueExercises = [];
        const exerciseMap = {};

        if (workoutData.exerciseLogs && workoutData.exerciseLogs.length > 0) {
          workoutData.exerciseLogs.forEach(log => {
            const exerciseId = log.exercise.id;

            if (!exerciseMap[exerciseId]) {
              exerciseMap[exerciseId] = log.exercise;
              uniqueExercises.push(log.exercise);
            }

            if (!groupedLogs[exerciseId]) {
              groupedLogs[exerciseId] = [];
            }

            groupedLogs[exerciseId].push({
              id: log.id,
              setNumber: log.setNumber,
              repsCompleted: log.repsCompleted.toString(),
              weightKg: log.weightKg.toString(),
              notes: log.notes || ''
            });
          });
        }

        setSelectedExercises(uniqueExercises);
        setExerciseLogs(groupedLogs);
      } else {
        // Create mode: just fetch exercises
        const data = await exerciseService.getAllExercises();
        setExercises(data);
        setOriginalWorkout(null);
        setSelectedExercises([]);
        setExerciseLogs({});
        setWorkoutName('');
        setWorkoutNotes('');
        setWorkoutDate(format(new Date(), 'yyyy-MM-dd'));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const markDirty = () => {
    setPendingChanges(true);
    setSaveStatus((previous) => (previous === 'error' ? 'error' : 'idle'));
  };

  const handleAddExercise = (exercise) => {
    if (selectedExercises.find(ex => ex.id === exercise.id)) {
      alert('Exercise already added');
      return;
    }

    setSelectedExercises([...selectedExercises, exercise]);

    // Initialize log data for this exercise (default 3 sets)
    setExerciseLogs({
      ...exerciseLogs,
      [exercise.id]: Array.from({ length: 3 }, (_, i) => ({
        id: null,
        setNumber: i + 1,
        repsCompleted: '',
        weightKg: '',
        notes: ''
      }))
    });

    setShowExercisePicker(false);
    markDirty();
  };

  const handleRemoveExercise = (exerciseId) => {
    setSelectedExercises(selectedExercises.filter(ex => ex.id !== exerciseId));
    const newLogs = { ...exerciseLogs };
    delete newLogs[exerciseId];
    setExerciseLogs(newLogs);
    markDirty();
  };

  const handleUpdateSet = (exerciseId, setIndex, field, value) => {
    const updatedLogs = { ...exerciseLogs };
    updatedLogs[exerciseId][setIndex][field] = value;
    setExerciseLogs(updatedLogs);
    markDirty();
  };

  const handleAddSet = (exerciseId) => {
    const updatedLogs = { ...exerciseLogs };
    const currentSets = updatedLogs[exerciseId];
    updatedLogs[exerciseId] = [
      ...currentSets,
      {
        id: null,
        setNumber: currentSets.length + 1,
        repsCompleted: '',
        weightKg: '',
        notes: ''
      }
    ];
    setExerciseLogs(updatedLogs);
    markDirty();
  };

  const handleRemoveSet = (exerciseId, setIndex) => {
    const updatedLogs = { ...exerciseLogs };
    updatedLogs[exerciseId] = updatedLogs[exerciseId].filter((_, i) => i !== setIndex);
    // Renumber remaining sets
    updatedLogs[exerciseId] = updatedLogs[exerciseId].map((set, i) => ({
      ...set,
      setNumber: i + 1
    }));
    setExerciseLogs(updatedLogs);
    markDirty();
  };

  const buildSyncPayload = () => {
    if (!workoutName.trim() || !workoutDate) {
      return null;
    }

    const validSets = [];
    for (const exercise of selectedExercises) {
      const sets = exerciseLogs[exercise.id] || [];
      for (const set of sets) {
        const repsCompleted = Number.parseInt(set.repsCompleted, 10);
        const weightKg = Number.parseFloat(set.weightKg);
        if (Number.isInteger(repsCompleted) && repsCompleted > 0 && Number.isFinite(weightKg) && weightKg > 0) {
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

    if (validSets.length === 0 && !workoutLogId) {
      return null;
    }

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

  const syncManualWorkout = async () => {
    if (isSyncInFlightRef.current) {
      hasQueuedSyncRef.current = true;
      return false;
    }

    const payload = buildSyncPayload();
    if (!payload) {
      return true;
    }

    isSyncInFlightRef.current = true;
    setSaveStatus('saving');
    setError(null);

    try {
      const response = await progressService.syncManualWorkout(payload);

      if (response.workoutLogId && !workoutLogId) {
        setWorkoutLogId(response.workoutLogId);
      }

      setExerciseLogs((previous) => applyCanonicalSetIds(previous, response.exerciseLogs || []));
      setPendingChanges(false);
      setSaveStatus('saved');
      setLastSavedAt(response.savedAt || new Date().toISOString());
      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Autosave failed. Your changes are still on screen.';
      setSaveStatus('error');
      setError(message);
      return false;
    } finally {
      isSyncInFlightRef.current = false;
      if (hasQueuedSyncRef.current && pendingChangesRef.current) {
        hasQueuedSyncRef.current = false;
        syncManualWorkout();
      }
    }
  };

  useEffect(() => {
    if (!pendingChanges) {
      return undefined;
    }

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(() => {
      syncManualWorkout();
    }, AUTO_SAVE_DEBOUNCE_MS);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [pendingChanges, workoutName, workoutDate, workoutNotes, selectedExercises, exerciseLogs, workoutLogId]);

  const handleDeleteWorkout = async () => {
    if (!workoutLogId) {
      return;
    }

    if (!confirm('Are you sure you want to delete this workout? This action cannot be undone.')) {
      return;
    }

    try {
      await progressService.deleteWorkoutLog(workoutLogId);
      alert('Workout deleted successfully!');
      navigate('/progress');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete workout');
      console.error('Error deleting workout:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {isEditMode ? 'Edit Workout' : 'Manual Workout Log'}
        </h1>
        <div className="card p-8 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !originalWorkout && isEditMode) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Edit Workout</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800 font-medium">Error: {error}</p>
          <button
            onClick={() => navigate('/progress')}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back to Progress
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              {isEditMode ? 'Edit Workout' : 'Manual Workout Log'}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {isEditMode ? 'Modify workout details, exercises, and sets' : 'Log a workout without a predefined plan'}
            </p>
          </div>
          <div className="w-full sm:w-auto flex flex-col gap-2 sm:items-end">
            <div className="text-xs sm:text-sm text-gray-600 sm:text-right">
              {saveStatus === 'saving' && 'Saving...'}
              {saveStatus === 'saved' && `All changes saved${lastSavedAt ? ` at ${format(new Date(lastSavedAt), 'p')}` : ''}`}
              {saveStatus === 'error' && 'Save failed'}
            </div>
            <div className="w-full sm:w-auto flex gap-2">
              {workoutLogId && (
                <button
                  onClick={handleDeleteWorkout}
                  className="btn-danger w-full sm:w-[150px] px-4 sm:px-6 py-2 text-sm sm:text-base"
                >
                  Delete
                </button>
              )}
              <button
                onClick={() => navigate('/progress')}
                className="btn-secondary bg-gray-600 text-white hover:bg-gray-700 w-full sm:w-[220px] px-5 sm:px-8 py-2 text-sm sm:text-base"
              >
                Back
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">{error}</p>
            {saveStatus === 'error' && (
              <button
                onClick={syncManualWorkout}
                className="mt-3 px-4 py-2 btn-secondary bg-red-600 text-white hover:bg-red-700 transition text-sm"
              >
                Retry Now
              </button>
            )}
          </div>
        )}

        {/* Workout Details */}
        <div className="card p-4 sm:p-6 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Workout Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Workout Name *
              </label>
              <input
                type="text"
                value={workoutName}
                onChange={(e) => {
                  setWorkoutName(e.target.value);
                  markDirty();
                }}
                placeholder="e.g., Chest & Triceps, Full Body"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Workout Date *
              </label>
              <input
                type="date"
                value={workoutDate}
                onChange={(e) => {
                  setWorkoutDate(e.target.value);
                  markDirty();
                }}
                max={format(new Date(), 'yyyy-MM-dd')}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={workoutNotes}
              onChange={(e) => {
                setWorkoutNotes(e.target.value);
                markDirty();
              }}
              placeholder="How did the workout feel? Any observations?"
              rows="2"
              className="input-field"
            ></textarea>
          </div>
        </div>

        {/* Selected Exercises */}
        <div className="card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              Exercises ({selectedExercises.length})
            </h2>
            <button
              onClick={() => setShowExercisePicker(true)}
              className="px-4 py-2 btn-primary transition text-sm sm:text-base w-full sm:w-auto"
            >
              + Add Exercise
            </button>
          </div>

          {selectedExercises.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-4">No exercises added yet</p>
              <button
                onClick={() => setShowExercisePicker(true)}
                className="px-6 py-2 btn-primary"
              >
                Add Your First Exercise
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {selectedExercises.map((exercise, exIndex) => (
                <ExerciseLogSection
                  key={exercise.id}
                  exercise={exercise}
                  exerciseIndex={exIndex}
                  sets={exerciseLogs[exercise.id] || []}
                  onUpdateSet={(setIndex, field, value) =>
                    handleUpdateSet(exercise.id, setIndex, field, value)
                  }
                  onAddSet={() => handleAddSet(exercise.id)}
                  onRemoveSet={(setIndex) => handleRemoveSet(exercise.id, setIndex)}
                  onRemoveExercise={() => handleRemoveExercise(exercise.id)}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Exercise Picker Modal */}
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

/**
 * Exercise Log Section Component
 * Section for logging sets for a single exercise
 */
function ExerciseLogSection({
  exercise,
  exerciseIndex,
  sets,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  onRemoveExercise
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-3 sm:px-4 py-3 text-white flex justify-between items-center gap-2">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
            {exerciseIndex + 1}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-bold truncate">{exercise.name}</h3>
            <p className="text-blue-100 text-xs sm:text-sm truncate">{exercise.muscleGroup?.name}</p>
          </div>
        </div>
        <button
          onClick={onRemoveExercise}
          className="px-2 sm:px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs sm:text-sm transition flex-shrink-0"
        >
          Remove
        </button>
      </div>

      <div className="p-4 space-y-3">
        {sets.map((set, setIndex) => (
          <SetLogInput
            key={setIndex}
            set={set}
            setIndex={setIndex}
            onUpdate={onUpdateSet}
            onRemove={() => onRemoveSet(setIndex)}
            showRemove={sets.length > 1}
          />
        ))}

        <button
          onClick={onAddSet}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
        >
          + Add Set
        </button>
      </div>
    </div>
  );
}

/**
 * Set Log Input Component
 * Input fields for a single set
 */
function SetLogInput({ set, setIndex, onUpdate, onRemove, showRemove }) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      {/* Mobile Layout - Stacked */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
            {set.setNumber}
          </div>
          {showRemove && (
            <button
              onClick={onRemove}
              className="flex-shrink-0 px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-xs"
              title="Remove set"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Reps *
            </label>
            <input
              type="number"
              min="1"
              value={set.repsCompleted}
              onChange={(e) => onUpdate(setIndex, 'repsCompleted', e.target.value)}
              placeholder="10"
              className="input-field text-sm !px-2 !py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Weight (kg) *
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={set.weightKg}
              onChange={(e) => onUpdate(setIndex, 'weightKg', e.target.value)}
              placeholder="20"
              className="input-field text-sm !px-2 !py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Notes
          </label>
          <input
            type="text"
            value={set.notes}
            onChange={(e) => onUpdate(setIndex, 'notes', e.target.value)}
            placeholder="Optional"
            className="input-field text-sm !px-2 !py-2"
          />
        </div>
      </div>

      {/* Desktop Layout - Single Row */}
      <div className="hidden sm:flex sm:items-center sm:gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
          {set.setNumber}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Reps *
          </label>
          <input
            type="number"
            min="1"
            value={set.repsCompleted}
            onChange={(e) => onUpdate(setIndex, 'repsCompleted', e.target.value)}
            placeholder="10"
            className="input-field w-20 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Weight (kg) *
          </label>
          <input
            type="number"
            step="0.5"
            min="0"
            value={set.weightKg}
            onChange={(e) => onUpdate(setIndex, 'weightKg', e.target.value)}
            placeholder="20"
            className="input-field w-20 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 flex-1">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Notes
          </label>
          <input
            type="text"
            value={set.notes}
            onChange={(e) => onUpdate(setIndex, 'notes', e.target.value)}
            placeholder="Optional"
            className="input-field flex-1 text-sm"
          />
        </div>

        {showRemove && (
          <button
            onClick={onRemove}
            className="flex-shrink-0 px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-xs"
            title="Remove set"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Exercise Picker Modal Component
 * Modal to select an exercise to add
 */
function ExercisePickerModal({ exercises, onSelect, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);
  useAccessibleModal({ isOpen: true, onClose, modalRef, initialFocusRef: closeBtnRef });

  const filteredExercises = exercises.filter(ex =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.muscleGroup?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exercise-picker-title"
        tabIndex={-1}
        className="card max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-3 sm:py-4 text-white flex justify-between items-center rounded-t-lg">
          <h2 id="exercise-picker-title" className="text-xl sm:text-2xl font-bold">Select Exercise</h2>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="text-white hover:text-gray-200 p-1"
            aria-label="Close exercise picker"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto">
          <label htmlFor="exercise-picker-search" className="sr-only">Search exercises</label>
          <input
            id="exercise-picker-search"
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field mb-4 text-sm sm:text-base"
            autoFocus
          />

          <div className="space-y-2">
            {filteredExercises.length === 0 ? (
              <p className="text-center text-gray-500 py-8 text-sm sm:text-base">No exercises found</p>
            ) : (
              filteredExercises.map(exercise => (
                <button
                  key={exercise.id}
                  onClick={() => onSelect(exercise)}
                  className="w-full text-left p-3 sm:p-4 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition"
                >
                  <h4 className="font-semibold text-gray-800 text-sm sm:text-base">{exercise.name}</h4>
                  <p className="text-xs sm:text-sm text-gray-600">{exercise.muscleGroup?.name}</p>
                  {exercise.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{exercise.description}</p>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManualWorkoutLog;


