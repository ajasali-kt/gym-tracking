import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import workoutService from '../../services/workoutService';
import progressService from '../../services/progressService';

/**
 * Workout Logger Component
 * Log workout performance for a specific day
 */
function WorkoutLogger() {
  const { dayId } = useParams();
  const navigate = useNavigate();
  const [workoutDay, setWorkoutDay] = useState(null);
  const [workoutLog, setWorkoutLog] = useState(null);
  const [exerciseLogs, setExerciseLogs] = useState({});
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutNotes, setWorkoutNotes] = useState('');

  useEffect(() => {
    fetchWorkoutDay();
  }, [dayId]);

  const fetchWorkoutDay = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workoutService.getWorkoutDayById(dayId);
      setWorkoutDay(data);

      // Initialize exercise logs structure
      const initialLogs = {};
      data.workoutDayExercises?.forEach(assignment => {
        initialLogs[assignment.exerciseId] = Array.from({ length: assignment.sets }, () => ({
          setNumber: 0,
          repsCompleted: '',
          weightKg: '',
          notes: ''
        }));
      });
      setExerciseLogs(initialLogs);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load workout details');
      console.error('Error fetching workout day:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = async () => {
    try {
      const logData = await progressService.startWorkoutLog({
        workoutDayId: parseInt(dayId),
        completedDate: format(new Date(), 'yyyy-MM-dd')
      });
      setWorkoutLog(logData);
      setWorkoutStarted(true);
    } catch (err) {
      alert('Failed to start workout: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const handleLogSet = async (exerciseId, setIndex) => {
    const setData = exerciseLogs[exerciseId][setIndex];

    if (!setData.repsCompleted || !setData.weightKg) {
      alert('Please enter reps and weight');
      return;
    }

    try {
      await progressService.logSet(workoutLog.id, {
        exerciseId: parseInt(exerciseId),
        setNumber: setIndex + 1,
        repsCompleted: parseInt(setData.repsCompleted),
        weightKg: parseFloat(setData.weightKg),
        notes: setData.notes || null
      });

      // Mark set as logged
      const updatedLogs = { ...exerciseLogs };
      updatedLogs[exerciseId][setIndex].logged = true;
      setExerciseLogs(updatedLogs);
    } catch (err) {
      alert('Failed to log set: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const handleUpdateSet = (exerciseId, setIndex, field, value) => {
    const updatedLogs = { ...exerciseLogs };
    updatedLogs[exerciseId][setIndex][field] = value;
    setExerciseLogs(updatedLogs);
  };

  const handleCompleteWorkout = async () => {
    if (!confirm('Are you sure you want to complete this workout? Make sure all sets are logged.')) {
      return;
    }

    try {
      await progressService.completeWorkout(workoutLog.id, {
        notes: workoutNotes || null
      });
      alert('Workout completed successfully!');
      navigate('/progress');
    } catch (err) {
      alert('Failed to complete workout: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const handleCancelWorkout = () => {
    if (confirm('Are you sure you want to cancel this workout? All logged data will be lost.')) {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Log Workout</h1>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Log Workout</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800 font-medium">Error: {error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!workoutDay) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Workout Not Found</h1>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <p className="text-gray-600 mb-4">The requested workout could not be found.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-gray-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const exercises = workoutDay.workoutDayExercises || [];

  if (!workoutStarted) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Ready to Start Workout</h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 text-white">
            <h2 className="text-2xl font-bold">{workoutDay.dayName}</h2>
            <p className="text-green-100 mt-1">
              {workoutDay.muscleGroup?.name || 'General Workout'} • {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Workout Overview ({exercises.length} exercises)
            </h3>

            <div className="space-y-3 mb-6">
              {exercises
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((assignment, index) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{assignment.exercise.name}</h4>
                        <p className="text-sm text-gray-600">
                          {assignment.exercise.muscleGroup?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="text-center">
                        <p className="text-gray-600">Sets</p>
                        <p className="font-bold text-gray-800">{assignment.sets}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600">Reps</p>
                        <p className="font-bold text-gray-800">{assignment.reps}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600">Rest</p>
                        <p className="font-bold text-gray-800">{assignment.restSeconds}s</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCancelWorkout}
                className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleStartWorkout}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition"
              >
                Start Workout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentExercise = exercises.sort((a, b) => a.orderIndex - b.orderIndex)[currentExerciseIndex];
  const totalExercises = exercises.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{workoutDay.dayName}</h1>
          <p className="text-gray-600 mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleCompleteWorkout}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Complete Workout
          </button>
          <button
            onClick={handleCancelWorkout}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Exercise {currentExerciseIndex + 1} of {totalExercises}
          </span>
          <span className="text-sm text-gray-600">
            {Math.round(((currentExerciseIndex + 1) / totalExercises) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentExerciseIndex + 1) / totalExercises) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Exercise Navigator */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-2 overflow-x-auto">
          {exercises.sort((a, b) => a.orderIndex - b.orderIndex).map((ex, index) => (
            <button
              key={ex.id}
              onClick={() => setCurrentExerciseIndex(index)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition ${
                index === currentExerciseIndex
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {index + 1}. {ex.exercise.name}
            </button>
          ))}
        </div>
      </div>

      {/* Current Exercise */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{currentExercise.exercise.name}</h2>
              <p className="text-blue-100 mt-1">
                {currentExercise.exercise.muscleGroup?.name} • {currentExercise.sets} sets × {currentExercise.reps} reps
              </p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">Rest Time</p>
              <p className="text-2xl font-bold">{currentExercise.restSeconds}s</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Exercise Description */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
            <p className="text-gray-700">{currentExercise.exercise.description}</p>
          </div>

          {/* Sets Logger */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800 mb-3">Log Sets</h3>
            {exerciseLogs[currentExercise.exerciseId]?.map((setData, setIndex) => (
              <SetLogger
                key={setIndex}
                setNumber={setIndex + 1}
                setData={setData}
                onUpdate={(field, value) => handleUpdateSet(currentExercise.exerciseId, setIndex, field, value)}
                onLog={() => handleLogSet(currentExercise.exerciseId, setIndex)}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentExerciseIndex(Math.max(0, currentExerciseIndex - 1))}
              disabled={currentExerciseIndex === 0}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous Exercise
            </button>
            <button
              onClick={() => setCurrentExerciseIndex(Math.min(totalExercises - 1, currentExerciseIndex + 1))}
              disabled={currentExerciseIndex === totalExercises - 1}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next Exercise
            </button>
          </div>
        </div>
      </div>

      {/* Workout Notes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-800 mb-3">Workout Notes (Optional)</h3>
        <textarea
          value={workoutNotes}
          onChange={(e) => setWorkoutNotes(e.target.value)}
          placeholder="How did the workout feel? Any observations?"
          rows="3"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        ></textarea>
      </div>
    </div>
  );
}

/**
 * Set Logger Component
 * Log individual set with reps and weight
 */
function SetLogger({ setNumber, setData, onUpdate, onLog }) {
  const [restTimer, setRestTimer] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (restTimer) {
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setRestTimer(null);
            // Play notification sound or vibrate
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [restTimer]);

  const startRestTimer = (seconds) => {
    setTimeRemaining(seconds);
    setRestTimer(true);
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${setData.logged ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-800">Set {setNumber}</h4>
        {setData.logged && (
          <span className="px-2 py-1 bg-green-600 text-white text-xs font-medium rounded">
            Logged ✓
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reps Completed
          </label>
          <input
            type="number"
            min="1"
            value={setData.repsCompleted}
            onChange={(e) => onUpdate('repsCompleted', e.target.value)}
            disabled={setData.logged}
            placeholder="e.g., 10"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Weight (kg)
          </label>
          <input
            type="number"
            step="0.5"
            min="0"
            value={setData.weightKg}
            onChange={(e) => onUpdate('weightKg', e.target.value)}
            disabled={setData.logged}
            placeholder="e.g., 20"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes (Optional)
        </label>
        <input
          type="text"
          value={setData.notes}
          onChange={(e) => onUpdate('notes', e.target.value)}
          disabled={setData.logged}
          placeholder="e.g., Felt strong, good form"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      </div>

      {!setData.logged ? (
        <button
          onClick={onLog}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition"
        >
          Log Set
        </button>
      ) : (
        <div className="flex space-x-2">
          {restTimer ? (
            <div className="flex-1 px-4 py-2 bg-orange-100 text-orange-800 rounded-lg font-medium text-center">
              Rest: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </div>
          ) : (
            <button
              onClick={() => startRestTimer(90)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
            >
              Start Rest Timer
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default WorkoutLogger;
