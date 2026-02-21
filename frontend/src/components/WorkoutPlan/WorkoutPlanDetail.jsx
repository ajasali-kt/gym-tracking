import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import workoutService from '../../services/workoutService';
import exerciseService from '../../services/exerciseService';
import useAccessibleModal from '../../hooks/useAccessibleModal';

/**
 * Workout Plan Detail Component
 * View and edit a specific workout plan with all 7 days
 */
function WorkoutPlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingDay, setEditingDay] = useState(null);
  const [showAddDayModal, setShowAddDayModal] = useState(false);
  const [selectedDayNumber, setSelectedDayNumber] = useState(null);

  useEffect(() => {
    fetchPlanDetails();
  }, [id]);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workoutService.getPlanById(id);
      setPlan(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load plan details');
      console.error('Error fetching plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDay = async (dayId) => {
    if (!confirm('Are you sure you want to delete this workout day?')) {
      return;
    }

    try {
      await workoutService.deleteWorkoutDay(dayId);
      await fetchPlanDetails();
    } catch (err) {
      alert('Failed to delete day: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-800">Plan Details</h1>
          <div className="card p-8 text-center">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-800">Plan Details</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800 font-medium">Error: {error}</p>
            <button
              onClick={fetchPlanDetails}
              className="mt-4 px-4 py-2 btn-danger mr-2"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/plans')}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Back to Plans
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!plan) {
    return (
      <>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-800">Plan Not Found</h1>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-600 mb-4">The requested plan could not be found.</p>
            <button
              onClick={() => navigate('/plans')}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Back to Plans
            </button>
          </div>
        </div>
      </>
    );
  }

  const workoutDays = plan.workoutDays || [];

  // Calculate the number of days in the plan based on start and end dates
  const calculatePlanDays = () => {
    const startDate = new Date(plan.startDate);
    startDate.setHours(0, 0, 0, 0);

    // If no end date, default to 7 days
    if (!plan.endDate) {
      return 7;
    }

    const endDate = new Date(plan.endDate);
    endDate.setHours(0, 0, 0, 0);

    // Calculate difference in days
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates

    return diffDays > 0 ? diffDays : 7; // Ensure at least 1 day
  };

  // Calculate the actual dates for the plan
  const getPlanDates = () => {
    const startDate = new Date(plan.startDate);
    startDate.setHours(0, 0, 0, 0);

    const numberOfDays = calculatePlanDays();
    const planDates = [];

    for (let i = 0; i < numberOfDays; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      planDates.push(date);
    }
    return planDates;
  };

  const planDates = getPlanDates();
  const numberOfDays = calculatePlanDays();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <h1 className="text-3xl font-bold text-gray-800">{plan.name}</h1>
              {plan.isActive && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  Active
                </span>
              )}
            </div>
            <div className="space-y-1 text-gray-600">
              <p>
                Started: {format(new Date(plan.startDate), 'MMMM d, yyyy')}
                {plan.endDate && ` • Ends: ${format(new Date(plan.endDate), 'MMMM d, yyyy')}`}
              </p>
              {(plan.duration || plan.trainingType || plan.split) && (
                <p className="text-sm">
                  {plan.duration && `${plan.duration}`}
                  {plan.trainingType && ` • ${plan.trainingType}`}
                  {plan.split && ` • ${plan.split}`}
                </p>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setSelectedDayNumber(null);
                setShowAddDayModal(true);
              }}
              className="px-4 py-2 btn-primary transition"
            >
              + Add Day
            </button>
            <button
              onClick={() => navigate('/plans')}
              className="px-4 py-2 btn-secondary bg-gray-600 text-white hover:bg-gray-700 transition"
            >
              Back to Plans
            </button>
          </div>
        </div>

        {/* Progression Notes */}
        {plan.notes && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">Progression Plan</h3>
            <div className="text-sm text-yellow-800 whitespace-pre-line">
              {plan.notes}
            </div>
          </div>
        )}

        {/* Workout Days Grid */}
        {workoutDays.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Workout Days Yet</h2>
            <p className="text-gray-600 mb-4">
              Start building your weekly plan by adding workout days.
            </p>
            <button
              onClick={() => {
                setSelectedDayNumber(null);
                setShowAddDayModal(true);
              }}
              className="px-6 py-2 btn-primary"
            >
              Add Your First Day
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {planDates.map((actualDate, index) => {
              const dayNumber = index + 1;
              const workoutDay = workoutDays.find(d => d.dayNumber === dayNumber);
              const isToday = actualDate.getTime() === today.getTime();

              return (
                <DayCard
                  key={dayNumber}
                  dayNumber={dayNumber}
                  actualDate={actualDate}
                  isToday={isToday}
                  workoutDay={workoutDay}
                  onEdit={() => setEditingDay(workoutDay)}
                  onDelete={() => handleDeleteDay(workoutDay.id)}
                  onAddDay={() => {
                    setSelectedDayNumber(dayNumber);
                    setShowAddDayModal(true);
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Add Day Modal */}
      {showAddDayModal && (
        <AddDayModal
          planId={plan.id}
          plan={plan}
          planDates={planDates}
          numberOfDays={numberOfDays}
          existingDays={workoutDays}
          initialDayNumber={selectedDayNumber}
          onClose={() => {
            setShowAddDayModal(false);
            setSelectedDayNumber(null);
          }}
          onSuccess={() => {
            setShowAddDayModal(false);
            setSelectedDayNumber(null);
            fetchPlanDetails();
          }}
        />
      )}

      {/* Edit Day Modal */}
      {editingDay && (
        <EditDayModal
          workoutDay={editingDay}
          onClose={() => setEditingDay(null)}
          onSuccess={() => {
            setEditingDay(null);
            fetchPlanDetails();
          }}
        />
      )}
    </>
  );
}

/**
 * Day Card Component
 * Displays a single day with its workout
 */
function DayCard({ dayNumber, actualDate, isToday, workoutDay, onEdit, onDelete, onAddDay }) {
  const dateStr = format(actualDate, 'EEEE, MMM d, yyyy'); // e.g., "Monday, Jan 15, 2026"

  if (!workoutDay) {
    return (
      <div className={`bg-gray-50 border-2 border-dashed rounded-lg p-6 ${isToday ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-500">
                Day {dayNumber}
              </h3>
              {isToday && (
                <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded">
                  TODAY
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-1">{dateStr} • Rest day or not scheduled</p>
          </div>
          <button
            onClick={onAddDay}
            className="px-4 py-2 btn-primary transition text-sm"
          >
            + Add Workout
          </button>
        </div>
      </div>
    );
  }

  const exercises = workoutDay.workoutDayExercises || [];

  return (
    <div className={`bg-white border rounded-lg shadow hover:shadow-md transition overflow-hidden ${isToday ? 'border-blue-500 border-2 ring-2 ring-blue-200' : 'border-gray-200'}`}>
      <div className={`bg-gradient-to-r px-6 py-4 text-white ${isToday ? 'from-blue-600 to-blue-700' : 'from-blue-500 to-blue-600'}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-xl font-bold">{workoutDay.dayName}</h3>
              {isToday && (
                <span className="px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded animate-pulse">
                  TODAY
                </span>
              )}
            </div>
            <p className="text-blue-100 text-sm">
              Day {dayNumber} • {dateStr}
            </p>
            <p className="text-blue-100 text-sm mt-1">
              {workoutDay.muscleGroup?.name || 'General Workout'}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onEdit}
              className="px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded transition text-sm"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded transition text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {exercises.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500 mb-3">No exercises added yet</p>
            <button
              onClick={onEdit}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              + Add Exercises
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {exercises
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((assignment, index) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
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
        )}
      </div>
    </div>
  );
}

/**
 * Add Day Modal Component
 */
function AddDayModal({ planId, planDates, existingDays, initialDayNumber, onClose, onSuccess }) {
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [formData, setFormData] = useState({
    dayNumber: initialDayNumber || 1,
    dayName: '',
    muscleGroupId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);
  useAccessibleModal({ isOpen: true, onClose, modalRef, initialFocusRef: closeBtnRef });

  useEffect(() => {
    fetchMuscleGroups();
  }, []);

  const fetchMuscleGroups = async () => {
    try {
      const data = await exerciseService.getAllMuscleGroups();
      setMuscleGroups(data);
    } catch (err) {
      console.error('Error fetching muscle groups:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        dayNumber: parseInt(formData.dayNumber),
        dayName: formData.dayName,
        muscleGroupId: formData.muscleGroupId ? parseInt(formData.muscleGroupId) : null
      };
      await workoutService.addDayToPlan(planId, payload);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add day');
    } finally {
      setLoading(false);
    }
  };

  const existingDayNumbers = existingDays.map(d => d.dayNumber);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-day-title"
        tabIndex={-1}
        className="card max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white flex justify-between items-center">
          <h2 id="add-day-title" className="text-2xl font-bold">Add Workout Day</h2>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="text-white hover:text-gray-200"
            aria-label="Close add workout day modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="add-day-number" className="block text-sm font-medium text-gray-700 mb-2">
              Select Day *
            </label>
            <select
              id="add-day-number"
              required
              value={formData.dayNumber}
              onChange={(e) => setFormData({ ...formData, dayNumber: e.target.value })}
              className="input-field"
            >
              {planDates.map((actualDate, index) => {
                const dateStr = format(actualDate, 'EEEE, MMM d, yyyy'); // e.g., "Monday, Jan 15, 2026"
                const dayNum = index + 1;
                return (
                  <option
                    key={dayNum}
                    value={dayNum}
                    disabled={existingDayNumbers.includes(dayNum)}
                  >
                    Day {dayNum} - {dateStr} {existingDayNumbers.includes(dayNum) ? '(Already added)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label htmlFor="add-day-name" className="block text-sm font-medium text-gray-700 mb-2">
              Day Name *
            </label>
            <input
              id="add-day-name"
              type="text"
              required
              value={formData.dayName}
              onChange={(e) => setFormData({ ...formData, dayName: e.target.value })}
              placeholder="e.g., Chest Day, Leg Day"
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="add-day-muscle-group" className="block text-sm font-medium text-gray-700 mb-2">
              Primary Muscle Group (Optional)
            </label>
            <select
              id="add-day-muscle-group"
              value={formData.muscleGroupId}
              onChange={(e) => setFormData({ ...formData, muscleGroupId: e.target.value })}
              className="input-field"
            >
              <option value="">None</option>
              {muscleGroups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 btn-primary disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Day'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Edit Day Modal Component
 */
function EditDayModal({ workoutDay, onClose, onSuccess }) {
  const [exercises, setExercises] = useState([]);
  const [assignments, setAssignments] = useState(workoutDay.workoutDayExercises || []);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);
  useAccessibleModal({ isOpen: true, onClose, modalRef, initialFocusRef: closeBtnRef });

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const data = await exerciseService.getAllExercises();
      setExercises(data);
    } catch (err) {
      console.error('Error fetching exercises:', err);
    }
  };

  const handleRemoveExercise = async (assignmentId) => {
    if (!confirm('Remove this exercise from the workout day?')) {
      return;
    }

    try {
      await workoutService.removeExerciseFromDay(assignmentId);
      setAssignments(assignments.filter(a => a.id !== assignmentId));
    } catch (err) {
      alert('Failed to remove exercise: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const handleAddExercise = async (exerciseData) => {
    try {
      await workoutService.addExerciseToDay(workoutDay.id, exerciseData);
      setShowAddExerciseModal(false);
      onSuccess();
    } catch (err) {
      alert('Failed to add exercise: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-day-title"
        tabIndex={-1}
        className="card max-w-4xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white flex justify-between items-center rounded-t-lg flex-shrink-0">
          <div>
            <h2 id="edit-day-title" className="text-2xl font-bold">Edit {workoutDay.dayName}</h2>
            <p className="text-blue-100 text-sm">Day {workoutDay.dayNumber}</p>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="text-white hover:text-gray-200"
            aria-label="Close edit workout day modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Exercises ({assignments.length})</h3>
            <button
              onClick={() => setShowAddExerciseModal(true)}
              className="px-4 py-2 btn-primary"
            >
              + Add Exercise
            </button>
          </div>

          {assignments.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">No exercises added yet</p>
              <button
                onClick={() => setShowAddExerciseModal(true)}
                className="px-6 py-2 btn-primary"
              >
                Add First Exercise
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((assignment, index) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{assignment.exercise.name}</h4>
                        <p className="text-sm text-gray-600">
                          {assignment.exercise.muscleGroup?.name}
                        </p>
                      </div>
                      <div className="flex items-center space-x-6 text-sm">
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
                    <button
                      onClick={() => handleRemoveExercise(assignment.id)}
                      className="ml-4 px-3 py-1 btn-danger text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>

        {showAddExerciseModal && (
          <AddExerciseToDayModal
            exercises={exercises}
            existingExerciseIds={assignments.map(a => a.exerciseId)}
            onClose={() => setShowAddExerciseModal(false)}
            onAdd={handleAddExercise}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Add Exercise to Day Modal
 */
function AddExerciseToDayModal({ exercises, existingExerciseIds, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    exerciseId: '',
    sets: 3,
    reps: '10',
    restSeconds: 60
  });
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);
  useAccessibleModal({ isOpen: true, onClose, modalRef, initialFocusRef: closeBtnRef });

  const availableExercises = exercises.filter(ex => !existingExerciseIds.includes(ex.id));
  const filteredExercises = availableExercises.filter(ex =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const orderIndex = existingExerciseIds.length + 1;
    onAdd({
      exerciseId: parseInt(formData.exerciseId),
      sets: parseInt(formData.sets),
      reps: formData.reps,
      restSeconds: parseInt(formData.restSeconds),
      orderIndex
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-exercise-title"
        tabIndex={-1}
        className="card max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 text-white flex justify-between items-center">
          <h2 id="add-exercise-title" className="text-2xl font-bold">Add Exercise</h2>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="text-white hover:text-gray-200"
            aria-label="Close add exercise modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="search-exercise-input" className="block text-sm font-medium text-gray-700 mb-2">
              Search Exercise *
            </label>
            <input
              id="search-exercise-input"
              type="text"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field mb-2"
            />
            <select
              id="select-exercise-input"
              required
              value={formData.exerciseId}
              onChange={(e) => {
                setFormData({ ...formData, exerciseId: e.target.value });
                setSelectedExercise(exercises.find(ex => ex.id === parseInt(e.target.value)));
              }}
              className="input-field"
              size="5"
            >
              <option value="">Select an exercise...</option>
              {filteredExercises.map(exercise => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name} ({exercise.muscleGroup?.name})
                </option>
              ))}
            </select>
          </div>

          {selectedExercise && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-semibold text-gray-800 mb-1">{selectedExercise.name}</h4>
              <p className="text-sm text-gray-600">{selectedExercise.description}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="add-exercise-sets" className="block text-sm font-medium text-gray-700 mb-2">
                Sets *
              </label>
              <input
                id="add-exercise-sets"
                type="number"
                required
                min="1"
                max="10"
                value={formData.sets}
                onChange={(e) => setFormData({ ...formData, sets: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="add-exercise-reps" className="block text-sm font-medium text-gray-700 mb-2">
                Reps *
              </label>
              <input
                id="add-exercise-reps"
                type="text"
                required
                value={formData.reps}
                onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
                placeholder="e.g., 10 or 8-12"
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="add-exercise-rest" className="block text-sm font-medium text-gray-700 mb-2">
                Rest (sec) *
              </label>
              <input
                id="add-exercise-rest"
                type="number"
                required
                min="30"
                max="300"
                step="15"
                value={formData.restSeconds}
                onChange={(e) => setFormData({ ...formData, restSeconds: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add Exercise
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WorkoutPlanDetail;

