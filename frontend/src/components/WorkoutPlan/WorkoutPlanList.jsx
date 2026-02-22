import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import workoutService from '../../services/workoutService';
import useAccessibleModal from '../../hooks/useAccessibleModal';

/**
 * Workout Plan List Component
 * View and manage all workout plans
 */
function WorkoutPlanList() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workoutService.getAllPlans();
      setPlans(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load workout plans');
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!confirm('Are you sure you want to delete this workout plan? This will also delete all associated workout days and exercises.')) {
      return;
    }

    try {
      await workoutService.deletePlan(planId);
      setPlans(plans.filter(p => p.id !== planId));
    } catch (err) {
      alert('Failed to delete plan: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const handleSetActivePlan = async (planId) => {
    try {
      await workoutService.setActivePlan(planId);
      await fetchPlans();
    } catch (err) {
      alert('Failed to set active plan: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-800">Workout Plans</h1>
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
          <h1 className="text-3xl font-bold text-gray-800">Workout Plans</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800 font-medium">Error: {error}</p>
            <button
              onClick={fetchPlans}
              className="mt-4 px-4 py-2 btn-danger"
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Workout Plans</h1>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition text-sm sm:text-base"
            >
              Import from JSON
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 sm:px-6 py-2 sm:py-3 btn-primary font-medium transition text-sm sm:text-base"
            >
              + Create New Plan
            </button>
          </div>
        </div>

        {/* Plans List */}
        {plans.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Workout Plans Yet</h2>
            <p className="text-gray-600 mb-4">
              Create your first workout plan to start tracking your fitness journey!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 btn-primary"
            >
              Create Your First Plan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onDelete={handleDeletePlan}
                onSetActive={handleSetActivePlan}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Plan Modal */}
      {showCreateModal && (
        <CreatePlanModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchPlans();
          }}
        />
      )}

      {/* Import Plan Modal */}
      {showImportModal && (
        <ImportPlanModal
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            setShowImportModal(false);
            fetchPlans();
          }}
        />
      )}
    </>
  );
}

/**
 * Plan Card Component
 * Displays individual plan in a card
 */
function PlanCard({ plan, onDelete, onSetActive }) {
  const navigate = useNavigate();

  return (
    <div className="card hover:shadow-lg transition overflow-hidden">
      {plan.isActive && (
        <div className="bg-green-600 text-white text-center py-2 text-sm font-medium">
          Active Plan
        </div>
      )}

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <p>
            <span className="font-medium">Started:</span> {format(new Date(plan.startDate), 'MMM d, yyyy')}
          </p>
          {plan.endDate && (
            <p>
              <span className="font-medium">Ends:</span> {format(new Date(plan.endDate), 'MMM d, yyyy')}
            </p>
          )}
          <p>
            <span className="font-medium">Status:</span>{' '}
            <span className={plan.isActive ? 'text-green-600 font-medium' : 'text-gray-500'}>
              {plan.isActive ? 'Active' : 'Inactive'}
            </span>
          </p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/plans/${plan.id}`)}
            className="flex-1 px-4 py-2 btn-primary transition text-sm font-medium"
          >
            View Details
          </button>
          {!plan.isActive && (
            <button
              onClick={() => onSetActive(plan.id)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm font-medium"
              title="Set as active plan"
            >
              Activate
            </button>
          )}
          <button
            onClick={() => onDelete(plan.id)}
            className="px-4 py-2 btn-danger transition text-sm font-medium"
            title="Delete plan"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Create Plan Modal Component
 */
function CreatePlanModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);
  useAccessibleModal({ isOpen: true, onClose, modalRef, initialFocusRef: closeBtnRef });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate || null
      };
      await workoutService.createPlan(payload);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create plan');
    } finally {
      setLoading(false);
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
        aria-labelledby="create-plan-title"
        tabIndex={-1}
        className="card max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white flex justify-between items-center">
          <h2 id="create-plan-title" className="text-2xl font-bold">Create Workout Plan</h2>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="text-white hover:text-gray-200 transition"
            aria-label="Close create plan modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="plan-name" className="block text-sm font-medium text-gray-700 mb-2">
              Plan Name *
            </label>
            <input
              id="plan-name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Strength Training Week 1"
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="plan-start-date" className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              id="plan-start-date"
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="plan-end-date" className="block text-sm font-medium text-gray-700 mb-2">
              End Date (Optional)
            </label>
            <input
              id="plan-end-date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 btn-secondary transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 btn-primary transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Import Plan Modal Component
 * Import workout plan from JSON
 */
function ImportPlanModal({ onClose, onSuccess }) {
  const [jsonInput, setJsonInput] = useState('');
  const [planName, setPlanName] = useState('');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);
  useAccessibleModal({ isOpen: true, onClose, modalRef, initialFocusRef: closeBtnRef });

  const handleJsonChange = (e) => {
    const value = e.target.value;
    setJsonInput(value);
    setValidationError(null);

    // Try to parse and validate JSON
    if (value.trim()) {
      try {
        JSON.parse(value);
      } catch (err) {
        setValidationError('Invalid JSON format');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setValidationError(null);

    try {
      // Parse JSON
      const planData = JSON.parse(jsonInput);

      // Validate required fields
      if (!planData.weeklySchedule) {
        throw new Error('Missing required field: weeklySchedule');
      }

      // Add plan name and start date
      const payload = {
        ...planData,
        planName: planName || undefined,
        startDate: startDate
      };

      await workoutService.importPlan(payload);
      onSuccess();
    } catch (err) {
      if (err instanceof SyntaxError) {
        setValidationError('Invalid JSON format');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to import plan');
      }
    } finally {
      setLoading(false);
    }
  };

  const exampleJson = {
    duration: "4 Weeks",
    trainingType: "Gym Only",
    split: "Body Part Split",
    weeklySchedule: {
      Day1: {
        bodyPart: "Chest + Triceps",
        exercises: [
          { name: "Barbell Bench Press", sets: 4, reps: "6-8" },
          { name: "Incline Dumbbell Press", sets: 3, reps: "8-10" }
        ]
      }
    },
    progressionPlan: {
      Week1: "Use current working weights",
      Week2: "Increase weight by 2.5kg on main lifts"
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
        aria-labelledby="import-plan-title"
        tabIndex={-1}
        className="card max-w-4xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 text-white flex justify-between items-center rounded-t-lg flex-shrink-0">
          <h2 id="import-plan-title" className="text-2xl font-bold">Import Workout Plan from JSON</h2>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="text-white hover:text-gray-200 transition"
            aria-label="Close import plan modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Example JSON */}
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-semibold text-blue-900">Example JSON Format:</h3>
              <button
                type="button"
                onClick={() => setJsonInput(JSON.stringify(exampleJson, null, 2))}
                className="text-xs px-3 py-1 btn-primary transition"
              >
                Use Example
              </button>
            </div>
            <pre className="text-xs text-blue-800 overflow-x-auto">
              {JSON.stringify(exampleJson, null, 2)}
            </pre>
          </div>

          <div>
            <label htmlFor="import-plan-name" className="block text-sm font-medium text-gray-700 mb-2">
              Plan Name (Optional)
            </label>
            <input
              id="import-plan-name"
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="Leave empty to auto-generate from JSON"
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="import-start-date" className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              id="import-start-date"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="import-plan-json" className="block text-sm font-medium text-gray-700 mb-2">
              Workout Plan JSON *
              {validationError && (
                <span className="text-red-600 ml-2 text-xs">({validationError})</span>
              )}
            </label>
            <textarea
              id="import-plan-json"
              required
              value={jsonInput}
              onChange={handleJsonChange}
              placeholder="Paste your workout plan JSON here..."
              rows={12}
              className={`w-full px-4 py-2 border ${
                validationError ? 'border-red-300' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm`}
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste the complete JSON structure including weeklySchedule, duration, etc.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 btn-secondary transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !!validationError}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Importing...' : 'Import Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WorkoutPlanList;

