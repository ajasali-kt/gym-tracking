import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import workoutService from '../../services/workoutService';
import exerciseService from '../../services/exerciseService';
import useAccessibleModal from '../../hooks/useAccessibleModal';
import CustomPopup from '../ui/CustomPopup';
import { getInvalidInputClass, isValidPositiveInteger } from '../../utils/inputValidation';

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
  const [deleteDayModal, setDeleteDayModal] = useState({ isOpen: false, workoutDay: null, actualDate: null });
  const [isDeletingDay, setIsDeletingDay] = useState(false);

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

  const openDeleteDayModal = (workoutDay, actualDate) => {
    setIsDeletingDay(false);
    setDeleteDayModal({ isOpen: true, workoutDay, actualDate });
  };

  if (loading) {
    return (
      <>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-app-primary">Plan Details</h1>
          <div className="card p-8 text-center">
            <div className="animate-pulse">
              <div className="h-4 bg-surface rounded w-1/4 mx-auto mb-4"></div>
              <div className="h-4 bg-surface rounded w-1/2 mx-auto"></div>
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
          <h1 className="text-3xl font-bold text-app-primary">Plan Details</h1>
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6">
            <p className="font-medium text-red-200">Error: {error}</p>
            <button
              id="workout-plan-detail-retry-button"
              onClick={fetchPlanDetails}
              className="mt-4 px-4 py-2 btn-danger mr-2"
            >
              Try Again
            </button>
            <button
              id="workout-plan-detail-back-to-plans-button"
              onClick={() => navigate('/plans')}
              className="mt-4 px-4 py-2 btn-secondary"
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
          <h1 className="text-3xl font-bold text-app-primary">Plan Not Found</h1>
          <div className="card p-6">
            <p className="text-app-muted mb-4">The requested plan could not be found.</p>
            <button
              id="workout-plan-detail-back-to-plans-button"
              onClick={() => navigate('/plans')}
              className="px-4 py-2 btn-secondary"
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
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <h1 className="text-3xl font-bold text-app-primary">{plan.name}</h1>
              {plan.isActive && (
                <span className="px-3 py-1 rounded-full border border-green-500/30 bg-green-500/15 text-sm font-medium text-green-200">
                  Active
                </span>
              )}
            </div>
            <div className="space-y-1 text-app-muted">
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
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {workoutDays.length > 0 && (
              <button
                id="workout-plan-detail-add-day-button"
                onClick={() => {
                  setSelectedDayNumber(null);
                  setShowAddDayModal(true);
                }}
                className="w-full sm:w-auto px-4 py-2 btn-outline transition"
              >
                + Add Day
              </button>
            )}
            <button
              id="workout-plan-detail-back-to-plans-button"
              onClick={() => navigate('/plans')}
              className="w-full sm:w-auto px-4 py-2 btn-secondary transition"
            >
              Back to Plans
            </button>
          </div>
        </div>

        {/* Progression Notes */}
        {plan.notes && (
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
            <h3 className="text-lg font-semibold text-yellow-200 mb-2">Progression Plan</h3>
            <div className="text-sm text-yellow-100/90 whitespace-pre-line">
              {plan.notes}
            </div>
          </div>
        )}

        {/* Workout Days Grid */}
        {workoutDays.length === 0 ? (
          <div className="card p-8 text-center">
            <h2 className="text-xl font-semibold text-app-primary mb-2">No Workout Days Yet</h2>
            <p className="text-app-muted mb-4">
              Start building your weekly plan by adding workout days.
            </p>
            <button
              id="workout-plan-detail-add-first-day-button"
              onClick={() => {
                setSelectedDayNumber(null);
                setShowAddDayModal(true);
              }}
              className="px-6 py-2 btn-outline"
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
                  onDelete={() => openDeleteDayModal(workoutDay, actualDate)}
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

      {/* Delete Day Modal */}
      {deleteDayModal.isOpen && deleteDayModal.workoutDay && (
        <CustomPopup
          isOpen={deleteDayModal.isOpen}
          title="Delete workout day?"
          idBase={`delete-day-${deleteDayModal.workoutDay.id}`}
          bodyText={[
            `Are you sure you want to delete ${deleteDayModal.workoutDay.dayName}?`,
            `Day ${deleteDayModal.workoutDay.dayNumber}${deleteDayModal.actualDate ? ` • ${format(deleteDayModal.actualDate, 'EEEE, MMM d, yyyy')}` : ''}`,
            'This will also delete all associated exercises for this day.'
          ].join('\n')}
          onClose={() => {
            setIsDeletingDay(false);
            setDeleteDayModal({ isOpen: false, workoutDay: null, actualDate: null });
          }}
          onOk={async () => {
            if (isDeletingDay) return;
            setIsDeletingDay(true);
            try {
              await workoutService.deleteWorkoutDay(deleteDayModal.workoutDay.id);
              setDeleteDayModal({ isOpen: false, workoutDay: null, actualDate: null });
              await fetchPlanDetails();
            } catch (err) {
              alert('Failed to delete day: ' + (err.response?.data?.message || 'Unknown error'));
            } finally {
              setIsDeletingDay(false);
            }
          }}
          buttonType="delete"
          buttonText={isDeletingDay ? 'Deleting...' : 'Delete'}
          okDisabled={isDeletingDay}
          maxWidthClassName="max-w-md"
        />
      )}

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
          onClose={() => {
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
      <div className={`rounded-lg border-2 border-dashed p-6 ${isToday ? 'border-neutral-500/60 bg-black/30' : 'border-app-subtle bg-surface'}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-app-muted">
                Day {dayNumber}
              </h3>
              {isToday && (
                <span className="px-2 py-1 bg-black text-white text-xs font-bold rounded border border-white/10">
                  TODAY
                </span>
              )}
            </div>
            <p className="text-sm text-app-muted mt-1">{dateStr} • Rest day or not scheduled</p>
          </div>
          <button
            id={`workout-plan-day-${dayNumber}-add-workout-button`}
            onClick={onAddDay}
            className="btn-green-outline text-sm"
          >
            + Add Workout
          </button>
        </div>
      </div>
    );
  }

  const exercises = workoutDay.workoutDayExercises || [];

  return (
    <div className={`card overflow-hidden transition ${isToday ? 'border-white/15 ring-2 ring-white/10' : ''}`}>
      <div className="border-b border-app-subtle bg-surface px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-app-primary sm:text-2xl">{workoutDay.dayName}</h3>
              {isToday && (
                <span className="px-2 py-1 rounded-full border border-green-500/30 bg-green-500/15 text-xs font-medium text-green-200">
                  Today
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-app-muted sm:text-base">
              Day {dayNumber} • {dateStr}
            </p>
            <p className="text-sm text-app-muted sm:text-base">
              {workoutDay.muscleGroup?.name || 'General Workout'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {exercises.length > 0 && (
              <button
                id={`workout-plan-day-${dayNumber}-edit-button`}
                onClick={onEdit}
                className="w-full sm:w-auto rounded-lg border border-green-500/40 px-3 py-1 text-sm text-green-300 transition hover:bg-green-500/15"
              >
                Edit
              </button>
            )}
            <button
              id={`workout-plan-day-${dayNumber}-delete-button`}
              onClick={onDelete}
              className="w-full sm:w-auto rounded-lg border border-red-500/40 px-3 py-1 text-sm text-red-300 transition hover:bg-red-500/10"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {exercises.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-app-muted mb-3">No exercises added yet</p>
            <button
              id={`workout-plan-day-${dayNumber}-add-exercises-button`}
              onClick={onEdit}
              className="btn-green-outline text-xs"
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
                  className="flex items-center justify-between rounded-lg bg-surface p-3"
                >
                  <div className="flex items-center space-x-3">
                    <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-app-subtle bg-surface text-xs font-semibold text-app-primary">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-app-primary">{assignment.exercise.name}</h4>
                      <p className="text-sm text-app-muted">
                        {assignment.exercise.muscleGroup?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="text-center">
                      <p className="text-app-muted">Sets</p>
                      <p className="font-bold text-app-primary">{assignment.sets}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-app-muted">Reps</p>
                      <p className="font-bold text-app-primary">{assignment.reps}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-app-muted">Rest</p>
                      <p className="font-bold text-app-primary">{assignment.restSeconds}s</p>
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-day-title"
        tabIndex={-1}
        className="w-full max-w-md rounded-2xl border border-app-subtle bg-card shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-app-subtle px-5 py-4">
          <h2 id="add-day-title" className="text-xl font-semibold text-app-primary">Add Workout Day</h2>
          <button
            ref={closeBtnRef}
            id="add-day-modal-close-button"
            onClick={onClose}
            className="text-app-muted hover:text-app-primary"
            aria-label="Close add workout day modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="add-day-number" className="block text-sm font-medium text-app-muted mb-2">
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
            <label htmlFor="add-day-name" className="block text-sm font-medium text-app-muted mb-2">
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
            <label htmlFor="add-day-muscle-group" className="block text-sm font-medium text-app-muted mb-2">
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

          <div className="pt-4 flex justify-end">
            <button
              id="add-day-submit-button"
              type="submit"
              disabled={loading}
              className="btn-outline px-4 py-2 disabled:opacity-50"
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
function EditDayModal({ workoutDay, onClose }) {
  const [exercises, setExercises] = useState([]);
  const [assignments, setAssignments] = useState(workoutDay.workoutDayExercises || []);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [removeExerciseModal, setRemoveExerciseModal] = useState({ isOpen: false, assignment: null });
  const [isRemovingExercise, setIsRemovingExercise] = useState(false);
  const [feedbackPopup, setFeedbackPopup] = useState({ isOpen: false, title: '', bodyText: '', idBase: '' });
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

  const openRemoveExerciseModal = (assignment) => {
    setIsRemovingExercise(false);
    setRemoveExerciseModal({ isOpen: true, assignment });
  };

  const closeRemoveExerciseModal = () => {
    setIsRemovingExercise(false);
    setRemoveExerciseModal({ isOpen: false, assignment: null });
  };

  const closeFeedbackPopup = () => {
    setFeedbackPopup((prev) => ({ ...prev, isOpen: false }));
  };

  const openFeedbackPopup = ({ title, bodyText, idBase }) => {
    setFeedbackPopup({ isOpen: true, title, bodyText, idBase });
  };

  const handleAddExercise = async (exerciseData) => {
    const exerciseId = Number(exerciseData?.exerciseId);
    const sets = Number(exerciseData?.sets);
    const reps = String(exerciseData?.reps ?? '').trim();
    const restSeconds = Number(exerciseData?.restSeconds);
    const orderIndex = Number(exerciseData?.orderIndex);

    if (!Number.isFinite(exerciseId)) {
      openFeedbackPopup({
        title: 'Select an exercise',
        bodyText: 'Please select an exercise from the list before adding it to the day.',
        idBase: `edit-day-${workoutDay.id}-missing-exercise`
      });
      return;
    }

    if (!Number.isFinite(sets) || !reps || !Number.isFinite(restSeconds) || !Number.isFinite(orderIndex)) {
      openFeedbackPopup({
        title: 'Missing required fields',
        bodyText: 'Please provide Sets, Reps, and Rest (sec) before adding the exercise.',
        idBase: `edit-day-${workoutDay.id}-missing-add-fields`
      });
      return;
    }

    try {
      await workoutService.addExerciseToDay(workoutDay.id, exerciseData);
      const updatedDay = await workoutService.getWorkoutDayById(workoutDay.id);
      setAssignments(updatedDay.workoutDayExercises || []);
      setShowAddExerciseModal(false);
    } catch (err) {
      openFeedbackPopup({
        title: 'Failed to add exercise',
        bodyText: err.response?.data?.message || 'Unknown error',
        idBase: `edit-day-${workoutDay.id}-add-exercise-failed`
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-day-title"
        tabIndex={-1}
        className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl border border-app-subtle bg-card shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-app-subtle px-6 py-4 flex-shrink-0">
          <div>
            <h2 id="edit-day-title" className="text-2xl font-bold text-app-primary">Edit {workoutDay.dayName}</h2>
            <p className="text-sm text-app-muted">Day {workoutDay.dayNumber}</p>
          </div>
          <button
            ref={closeBtnRef}
            id={`edit-day-${workoutDay.id}-close-button`}
            onClick={onClose}
            className="text-app-muted hover:text-app-primary"
            aria-label="Close edit workout day modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

          <div className="p-6 overflow-y-auto flex-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-app-primary">Exercises ({assignments.length})</h3>
              {assignments.length > 0 && (
                <button
                  id={`edit-day-${workoutDay.id}-add-exercise-button`}
                  onClick={() => setShowAddExerciseModal(true)}
                  className="px-4 py-2 btn-green-outline"
                >
                  + Add Exercise
                </button>
              )}
            </div>

              {assignments.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-app-muted mb-4">No exercises added yet</p>
                  <button
                    id={`edit-day-${workoutDay.id}-add-first-exercise-button`}
                    onClick={() => setShowAddExerciseModal(true)}
                    className="px-6 py-2 btn-outline"
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
                  className="flex items-center justify-between rounded-lg bg-surface p-4"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-app-subtle bg-surface text-xs font-semibold text-app-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-app-primary">{assignment.exercise.name}</h4>
                      <p className="text-sm text-app-muted">
                        {assignment.exercise.muscleGroup?.name}
                      </p>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <p className="text-app-muted">Sets</p>
                        <p className="font-bold text-app-primary">{assignment.sets}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-app-muted">Reps</p>
                        <p className="font-bold text-app-primary">{assignment.reps}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-app-muted">Rest</p>
                        <p className="font-bold text-app-primary">{assignment.restSeconds}s</p>
                      </div>
                    </div>
                  </div>
                    <button
                      id={`edit-day-assignment-${assignment.id}-remove-button`}
                      type="button"
                      onClick={() => openRemoveExerciseModal(assignment)}
                      className="ml-4 rounded-lg border border-red-500/40 px-2 py-1 text-sm text-red-300 transition hover:bg-red-500/10"
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

        {feedbackPopup.isOpen && (
          <CustomPopup
            isOpen={feedbackPopup.isOpen}
            title={feedbackPopup.title}
            idBase={feedbackPopup.idBase}
            bodyText={feedbackPopup.bodyText}
            onClose={closeFeedbackPopup}
            onOk={closeFeedbackPopup}
            buttonText="Ok"
            maxWidthClassName="max-w-md"
          />
        )}

        {removeExerciseModal.isOpen && removeExerciseModal.assignment && (
          <CustomPopup
            isOpen={removeExerciseModal.isOpen}
            title="Remove exercise?"
            idBase={`remove-exercise-${removeExerciseModal.assignment.id}`}
            bodyText={`Are you sure you want to remove ${removeExerciseModal.assignment.exercise?.name ?? 'this exercise'} from Day ${workoutDay.dayNumber} - ${workoutDay.dayName}?`}
            onClose={closeRemoveExerciseModal}
            onOk={async () => {
              if (isRemovingExercise) return;
              setIsRemovingExercise(true);
              try {
                await workoutService.removeExerciseFromDay(removeExerciseModal.assignment.id);
                setAssignments(prev => prev.filter(a => a.id !== removeExerciseModal.assignment.id));
                closeRemoveExerciseModal();
              } catch (err) {
                alert('Failed to remove exercise: ' + (err.response?.data?.message || 'Unknown error'));
              } finally {
                setIsRemovingExercise(false);
              }
            }}
            buttonType="delete"
            buttonText={isRemovingExercise ? 'Removing...' : 'Remove'}
            okDisabled={isRemovingExercise}
            maxWidthClassName="max-w-md"
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
  const searchInputRef = useRef(null);
  useAccessibleModal({ isOpen: true, onClose, modalRef, initialFocusRef: searchInputRef });

  const availableExercises = exercises.filter(ex => !existingExerciseIds.includes(ex.id));
  const filteredExercises = availableExercises.filter(ex =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const isSearchInvalid = !!searchTerm.trim() && filteredExercises.length === 0;

  const setsString = String(formData.sets ?? '').trim();
  const repsString = String(formData.reps ?? '').trim();
  const restString = String(formData.restSeconds ?? '').trim();

  const setsNumber = Number.parseInt(setsString, 10);
  const restNumber = Number.parseInt(restString, 10);

  const isSetsInvalid =
    !!setsString && (!isValidPositiveInteger(setsString) || (Number.isFinite(setsNumber) && (setsNumber < 1 || setsNumber > 10)));
  const isRepsInvalid = !!repsString && !isValidPositiveInteger(repsString);
  const isRestInvalid =
    !!restString &&
    (!isValidPositiveInteger(restString) || (Number.isFinite(restNumber) && (restNumber < 30 || restNumber > 300)));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSetsInvalid || isRepsInvalid || isRestInvalid) return;
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-exercise-title"
        tabIndex={-1}
        className="w-full max-w-lg rounded-2xl border border-app-subtle bg-card shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-app-subtle px-5 py-4">
          <h2 id="add-exercise-title" className="text-xl font-semibold text-app-primary">Add Exercise</h2>
          <button
            ref={closeBtnRef}
            id="workout-plan-add-exercise-modal-close-button"
            onClick={onClose}
            className="text-app-muted hover:text-app-primary"
            aria-label="Close add exercise modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label htmlFor="search-exercise-input" className="block text-sm font-medium text-app-muted mb-2">
              Search Exercise *
            </label>
            <input
              ref={searchInputRef}
              id="search-exercise-input"
              type="text"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`input-field mb-2 ${getInvalidInputClass(isSearchInvalid)}`}
              aria-invalid={isSearchInvalid}
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
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
              <h4 className="font-semibold text-blue-100 mb-1">{selectedExercise.name}</h4>
              <p className="text-sm text-blue-100/80">{selectedExercise.description}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="add-exercise-sets" className="block text-sm font-medium text-app-muted mb-2">
                Sets *
              </label>
              <input
                id="add-exercise-sets"
                type="number"
                required
                min="1"
                max="10"
                step="1"
                value={formData.sets}
                onChange={(e) => setFormData({ ...formData, sets: e.target.value })}
                inputMode="numeric"
                className={`input-field ${getInvalidInputClass(isSetsInvalid)}`}
              />
            </div>
            <div>
              <label htmlFor="add-exercise-reps" className="block text-sm font-medium text-app-muted mb-2">
                Reps *
              </label>
              <input
                id="add-exercise-reps"
                type="number"
                required
                min="1"
                step="1"
                value={formData.reps}
                onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
                placeholder="e.g., 10"
                inputMode="numeric"
                className={`input-field ${getInvalidInputClass(isRepsInvalid)}`}
              />
            </div>
            <div>
              <label htmlFor="add-exercise-rest" className="block text-sm font-medium text-app-muted mb-2">
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
                inputMode="numeric"
                className={`input-field ${getInvalidInputClass(isRestInvalid)}`}
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 pt-4">
            <button
              id="workout-plan-add-exercise-submit-button"
              type="submit"
              className="px-4 py-2 btn-green-outline"
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

