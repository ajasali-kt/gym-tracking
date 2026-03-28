import { useState, useEffect, useRef } from 'react';
import exerciseService from '../../services/exerciseService';
import useAccessibleModal from '../../hooks/useAccessibleModal';

/**
 * Exercise Library Component
 * Browse and manage all exercises
 */
function ExerciseLibrary() {
  const [exercises, setExercises] = useState([]);
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExercise, setSelectedExercise] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [exercisesData, muscleGroupsData] = await Promise.all([
        exerciseService.getAllExercises(),
        exerciseService.getAllMuscleGroups()
      ]);
      setExercises(exercisesData);
      setMuscleGroups(muscleGroupsData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load exercises');
      console.error('Error fetching exercises:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredExercises = exercises.filter(exercise => {
    const matchesMuscleGroup = selectedMuscleGroup === 'all' ||
      exercise.muscleGroupId === parseInt(selectedMuscleGroup);
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMuscleGroup && matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-app-primary">Exercise Library</h1>
        <div className="card p-8 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-surface rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-4 bg-surface rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-app-primary">Exercise Library</h1>
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-6">
          <p className="text-red-300 font-medium">Error: {error}</p>
          <button
            id="exercise-library-retry-button"
            onClick={fetchData}
            className="mt-4 btn-outline border-red-500/50 bg-red-500/10 text-red-300 hover:bg-red-500/15"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-app-primary">Exercise Library</h1>
          <p className="text-sm sm:text-base text-app-muted">
            {filteredExercises.length} of {exercises.length} exercises
          </p>
        </div>

        {/* Filters */}
        <div className="card p-4 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="label">
                Search Exercises
              </label>
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Muscle Group Filter */}
            <div>
              <label className="label">
                Filter by Muscle Group
              </label>
              <select
                value={selectedMuscleGroup}
                onChange={(e) => setSelectedMuscleGroup(e.target.value)}
                className="input-field"
              >
                <option value="all">All Muscle Groups</option>
                {muscleGroups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Exercise Grid */}
        {filteredExercises.length === 0 ? (
          <div className="card p-8 text-center text-app-muted">No exercises found matching your criteria.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map(exercise => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onClick={() => setSelectedExercise(exercise)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </>
  );
}

/**
 * Exercise Card Component
 * Displays exercise summary in a card
 */
function ExerciseCard({ exercise, onClick }) {
  return (
    <div
      onClick={onClick}
      className="card cursor-pointer overflow-hidden flex flex-col h-full transition duration-200 hover:-translate-y-0.5 hover:border-blue-500/50"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-app-primary flex-1">
            {exercise.name}
          </h3>
          {exercise.youtubeUrl && (
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          )}
        </div>

        <span className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-200 mb-3">
          {exercise.muscleGroup?.name || 'General'}
        </span>

        <p className="text-app-muted text-sm line-clamp-3">
          {exercise.description}
        </p>
      </div>

      <div className="bg-surface px-6 py-3 border-t border-app-subtle mt-auto">
        <p className="text-sm text-blue-200 font-medium">
          Click to view details →
        </p>
      </div>
    </div>
  );
}

/**
 * Exercise Detail Modal Component
 * Shows full exercise details in a modal
 */
function ExerciseDetailModal({ exercise, onClose }) {
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);
  useAccessibleModal({
    isOpen: !!exercise,
    onClose,
    modalRef,
    initialFocusRef: closeBtnRef
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exercise-detail-title"
        tabIndex={-1}
        className="w-full max-w-2xl max-h-[90vh] rounded-2xl border border-app-subtle bg-card shadow-card flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-app-subtle px-5 py-4">
          <div className="min-w-0">
            <h2 id="exercise-detail-title" className="truncate text-xl font-semibold text-app-primary">
              {exercise.name}
            </h2>
            <p className="mt-1 text-sm text-app-muted">
              {exercise.muscleGroup?.name || 'General'}
            </p>
          </div>
          <button
            ref={closeBtnRef}
            id={`exercise-detail-${exercise.id}-close-icon-button`}
            onClick={onClose}
            className="text-app-muted hover:text-app-primary"
            aria-label="Close exercise details"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-5 px-5 py-4 overflow-y-auto flex-1">
          <div>
            <h3 className="font-semibold text-app-primary mb-2">Description</h3>
            <p className="text-app-muted">{exercise.description}</p>
          </div>

          {/* Steps */}
          {exercise.steps && exercise.steps.length > 0 && (
            <div>
              <h3 className="font-semibold text-app-primary mb-3">How to Perform</h3>
              <ol className="m-0 list-none space-y-2.5 p-0">
                {exercise.steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-app-subtle bg-surface text-xs font-semibold text-app-primary">
                      {idx + 1}
                    </span>
                    <span className="flex-1 leading-6 text-app-muted">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {exercise.youtubeUrl && (
            <div>
              <a
                href={exercise.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center btn-outline border-red-500/50 bg-red-500/10 text-red-300 hover:bg-red-500/15 transition"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                Watch on YouTube
              </a>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default ExerciseLibrary;

