import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import exerciseService from '../../services/exerciseService';
import progressService from '../../services/progressService';

/**
 * Manual Workout Log Component
 * Allows users to manually log workouts without a predefined workout plan
 */
function ManualWorkoutLog() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [workoutDate, setWorkoutDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [workoutName, setWorkoutName] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [exerciseLogs, setExerciseLogs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const data = await exerciseService.getAllExercises();
      setExercises(data);
    } catch (err) {
      setError('Failed to load exercises');
      console.error('Error fetching exercises:', err);
    } finally {
      setLoading(false);
    }
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
        setNumber: i + 1,
        repsCompleted: '',
        weightKg: '',
        notes: ''
      }))
    });

    setShowExercisePicker(false);
  };

  const handleRemoveExercise = (exerciseId) => {
    setSelectedExercises(selectedExercises.filter(ex => ex.id !== exerciseId));
    const newLogs = { ...exerciseLogs };
    delete newLogs[exerciseId];
    setExerciseLogs(newLogs);
  };

  const handleUpdateSet = (exerciseId, setIndex, field, value) => {
    const updatedLogs = { ...exerciseLogs };
    updatedLogs[exerciseId][setIndex][field] = value;
    setExerciseLogs(updatedLogs);
  };

  const handleAddSet = (exerciseId) => {
    const updatedLogs = { ...exerciseLogs };
    const currentSets = updatedLogs[exerciseId];
    updatedLogs[exerciseId] = [
      ...currentSets,
      {
        setNumber: currentSets.length + 1,
        repsCompleted: '',
        weightKg: '',
        notes: ''
      }
    ];
    setExerciseLogs(updatedLogs);
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
  };

  const validateWorkout = () => {
    if (!workoutName.trim()) {
      alert('Please enter a workout name');
      return false;
    }

    if (selectedExercises.length === 0) {
      alert('Please add at least one exercise');
      return false;
    }

    // Check if at least one set is logged for each exercise
    for (const exercise of selectedExercises) {
      const sets = exerciseLogs[exercise.id];
      const hasValidSet = sets.some(set =>
        set.repsCompleted && set.weightKg
      );

      if (!hasValidSet) {
        alert(`Please log at least one set for ${exercise.name}`);
        return false;
      }
    }

    return true;
  };

  const handleSaveWorkout = async () => {
    if (!validateWorkout()) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Create manual workout log
      const workoutLogData = {
        completedDate: workoutDate,
        workoutName: workoutName,
        notes: workoutNotes || null,
        isManual: true
      };

      const workoutLog = await progressService.createManualWorkoutLog(workoutLogData);

      // Log all sets for all exercises
      for (const exercise of selectedExercises) {
        const sets = exerciseLogs[exercise.id];

        for (const set of sets) {
          if (set.repsCompleted && set.weightKg) {
            await progressService.logSet(workoutLog.id, {
              exerciseId: exercise.id,
              setNumber: set.setNumber,
              repsCompleted: parseInt(set.repsCompleted),
              weightKg: parseFloat(set.weightKg),
              notes: set.notes || null
            });
          }
        }
      }

      // Complete the workout
      await progressService.completeWorkout(workoutLog.id, {
        notes: workoutNotes || null
      });

      alert('Workout logged successfully!');
      navigate('/progress');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save workout');
      console.error('Error saving workout:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Manual Workout Log</h1>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Manual Workout Log</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Log a workout without a predefined plan</p>
        </div>
        <button
          onClick={() => navigate('/progress')}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm sm:text-base w-full sm:w-auto"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Workout Details */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Workout Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Workout Name *
            </label>
            <input
              type="text"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder="e.g., Chest & Triceps, Full Body"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Workout Date *
            </label>
            <input
              type="date"
              value={workoutDate}
              onChange={(e) => setWorkoutDate(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={workoutNotes}
            onChange={(e) => setWorkoutNotes(e.target.value)}
            placeholder="How did the workout feel? Any observations?"
            rows="2"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
      </div>

      {/* Selected Exercises */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            Exercises ({selectedExercises.length})
          </h2>
          <button
            onClick={() => setShowExercisePicker(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base w-full sm:w-auto"
          >
            + Add Exercise
          </button>
        </div>

        {selectedExercises.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">No exercises added yet</p>
            <button
              onClick={() => setShowExercisePicker(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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

      {/* Save Button */}
      {selectedExercises.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <button
            onClick={handleSaveWorkout}
            disabled={saving}
            className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {saving ? 'Saving Workout...' : 'Save Workout'}
          </button>
        </div>
      )}

      {/* Exercise Picker Modal */}
      {showExercisePicker && (
        <ExercisePickerModal
          exercises={exercises}
          onSelect={handleAddExercise}
          onClose={() => setShowExercisePicker(false)}
        />
      )}
    </div>
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
      <div className="flex items-center justify-between mb-2">
        <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">
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
            className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
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
            className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
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
          className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
        />
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
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-3 sm:py-4 text-white flex justify-between items-center rounded-t-lg">
          <h2 className="text-xl sm:text-2xl font-bold">Select Exercise</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 p-1">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto">
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4 text-sm sm:text-base"
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
