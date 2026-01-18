import { useState, useEffect, useRef } from 'react';
import workoutService from '../../services/workoutService';

/**
 * ExerciseTracker Component
 * Unified component for tracking workout exercises with real-time database updates
 * Shows minimized summary by default, expands to show full tracking and exercise details
 *
 * @param {Object} workoutLogData - Pre-fetched workout log data from parent (prevents N+1 API calls)
 */
function ExerciseTracker({ exercise, assignment, workoutLogId, workoutLogData, onExerciseComplete }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sets, setSets] = useState(() => {
    const initialSets = [];
    for (let i = 0; i < assignment.sets; i++) {
      initialSets.push({
        id: null, // Will be set when saved to DB
        setNumber: i + 1,
        completed: false,
        reps: '',
        time: '', // For time-based exercises (in minutes)
        weight: '', // Supports ranges like "10-15"
        notes: ''
      });
    }
    return initialSets;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [isLoadingExistingData, setIsLoadingExistingData] = useState(false);
  const [hasLoadedData, setHasLoadedData] = useState(false);

  // Use useRef for debounce timers to avoid memory leaks
  const saveTimerRef = useRef({});
  const saveQueueRef = useRef(new Map()); // Track pending saves per set
  const previousSetsRef = useRef([]); // Track previous sets state for comparison

  // Determine if this is a time-based exercise
  // Time-based exercises: Cardio, Running, Cycling, Plank, etc.
  const isTimeBased = exercise.category?.toLowerCase() === 'cardio' ||
                      exercise.name?.toLowerCase().includes('run') ||
                      exercise.name?.toLowerCase().includes('plank') ||
                      exercise.name?.toLowerCase().includes('cardio') ||
                      exercise.muscleGroup?.name?.toLowerCase() === 'cardio';

  // Load existing workout data from pre-fetched workoutLogData (passed from parent)
  // This prevents the N+1 query problem where each ExerciseTracker fetches the same workout log
  useEffect(() => {
    if (!workoutLogData || hasLoadedData) return;

    try {
      setIsLoadingExistingData(true);

      // Filter exercise logs for this specific exercise
      const exerciseLogs = workoutLogData.exerciseLogs?.filter(
        log => log.exerciseId === exercise.id
      ) || [];

      if (exerciseLogs.length > 0) {
        // Map existing logs to sets
        const updatedSets = [...sets];

        exerciseLogs.forEach(log => {
          const setIndex = log.setNumber - 1;
          if (setIndex >= 0 && setIndex < updatedSets.length) {
            // Extract time from notes if it exists
            let time = '';
            let weight = '';
            let cleanNotes = log.notes || '';

            // Parse notes for time (format: "Time: X min | notes" or just "Time: X min")
            if (log.notes) {
              const timeMatch = log.notes.match(/Time:\s*(\S+)\s*min/);

              if (timeMatch) {
                time = timeMatch[1];
                // Remove the time portion from notes
                cleanNotes = cleanNotes.replace(/Time:\s*\S+\s*min\s*\|\s*/, '');
                cleanNotes = cleanNotes.replace(/Time:\s*\S+\s*min/, '');
              }

              // For backwards compatibility: handle old format where weight was in notes
              const weightMatch = log.notes.match(/Weight:\s*(\S+)\s*kg/);
              if (weightMatch) {
                weight = weightMatch[1];
                cleanNotes = cleanNotes.replace(/Weight:\s*\S+\s*kg\s*\|\s*/, '');
                cleanNotes = cleanNotes.replace(/Weight:\s*\S+\s*kg/, '');
              }
            }

            // Always use weightKg field if available (new format)
            if (log.weightKg > 0) {
              weight = log.weightKg.toString();
            }

            updatedSets[setIndex] = {
              id: log.id,
              setNumber: log.setNumber,
              completed: log.repsCompleted > 0 || log.weightKg > 0, // Mark as completed if data exists
              reps: log.repsCompleted > 0 ? log.repsCompleted.toString() : '',
              time: time,
              weight: weight,
              notes: cleanNotes.trim()
            };
          }
        });

        setSets(updatedSets);
        console.log(`Loaded ${exerciseLogs.length} existing sets for ${exercise.name}`);
      }

      setHasLoadedData(true);
    } catch (error) {
      console.error('Error loading existing workout data:', error);
      // Don't show error to user, just continue with empty sets
      setHasLoadedData(true);
    } finally {
      setIsLoadingExistingData(false);
    }
  }, [workoutLogData, exercise.id]);

  /**
   * Auto-save effect with debouncing
   * This useEffect hook monitors changes to the sets state and automatically
   * saves modified sets to the database after a debounce delay.
   *
   * Benefits of using useEffect for auto-save:
   * - Separation of concerns: handleSetChange only updates state
   * - Centralized save logic: All saves go through one place
   * - Easier to test and maintain
   * - Follows React best practices for side effects
   */
  useEffect(() => {
    // Skip if no workout log (can't save without a workout session)
    if (!workoutLogId) return;

    // Skip on initial mount or when loading existing data
    if (isLoadingExistingData || !hasLoadedData) return;

    // Compare each set with previous state to detect changes
    sets.forEach((currentSet, index) => {
      const previousSet = previousSetsRef.current[index];

      // Skip if this is the first render or set doesn't exist
      if (!previousSet) return;

      // Check if any saveable fields have changed
      const hasChanged =
        currentSet.weight !== previousSet.weight ||
        currentSet.reps !== previousSet.reps ||
        currentSet.time !== previousSet.time ||
        currentSet.notes !== previousSet.notes;

      if (hasChanged) {
        // Clear existing timer for this specific set
        if (saveTimerRef.current[index]) {
          clearTimeout(saveTimerRef.current[index]);
        }

        // Debounce: Set new timer for this set
        // Wait 800ms after user stops typing before saving
        saveTimerRef.current[index] = setTimeout(() => {
          saveSetToDatabase(index, currentSet);
          delete saveTimerRef.current[index];
        }, 800);
      }
    });

    // Update previous sets reference for next comparison
    previousSetsRef.current = sets;

    // Cleanup: Clear all timers on unmount
    return () => {
      Object.values(saveTimerRef.current).forEach(timer => {
        if (timer) clearTimeout(timer);
      });
    };
  }, [sets, workoutLogId, isLoadingExistingData, hasLoadedData]);

  /**
   * Improved auto-save function with better error handling and user feedback
   * Features:
   * - Debounced saves to reduce API calls
   * - Queue management to prevent concurrent saves
   * - Better error handling with retry logic
   * - Visual feedback for save status
   */
  const saveSetToDatabase = async (setIndex, setData) => {
    if (!workoutLogId) {
      console.log('No workout log ID - skipping database save');
      return;
    }

    // Skip if no meaningful data to save
    const hasData = setData.reps || setData.weight || setData.time || setData.notes;
    if (!hasData) {
      return;
    }

    // Check if there's already a pending save for this set
    const pendingKey = `${exercise.id}-${setIndex}`;
    if (saveQueueRef.current.has(pendingKey)) {
      console.log(`Save already in progress for set ${setData.setNumber}, queuing...`);
      return;
    }

    try {
      // Mark this set as being saved
      saveQueueRef.current.set(pendingKey, true);
      setIsSaving(true);
      setSaveError(null);

      // Parse weight - handle ranges like "10-15" or single values like "20"
      let weightValue = 0;
      if (setData.weight) {
        // If it's a range like "10-15", take the average
        if (setData.weight.includes('-')) {
          const [min, max] = setData.weight.split('-').map(v => parseFloat(v.trim()));
          weightValue = (min + max) / 2;
        } else {
          weightValue = parseFloat(setData.weight) || 0;
        }
      }

      // Build notes string only with time (for cardio) and user notes
      let notesString = '';
      if (setData.time) {
        notesString += `Time: ${setData.time} min`;
      }
      if (setData.notes) {
        if (notesString) notesString += ' | ';
        notesString += setData.notes;
      }

      const payload = {
        exerciseId: exercise.id,
        setNumber: setData.setNumber,
        repsCompleted: parseInt(setData.reps) || 0,
        weightKg: weightValue,
        notes: notesString || null
      };

      // If set already has an ID, update it; otherwise create new
      if (setData.id) {
        await workoutService.updateSet(setData.id, {
          repsCompleted: payload.repsCompleted,
          weightKg: payload.weightKg,
          notes: payload.notes
        });
        console.log(`✓ Set ${setData.setNumber} updated successfully`);
      } else {
        const response = await workoutService.logSet(workoutLogId, payload);
        // Update the set with the database ID
        const updatedSets = [...sets];
        updatedSets[setIndex].id = response.id;
        setSets(updatedSets);
        console.log(`✓ Set ${setData.setNumber} saved with ID: ${response.id}`);
      }

      // Update last saved timestamp
      setLastSaved(new Date());

    } catch (error) {
      console.error(`✗ Error saving set ${setData.setNumber}:`, error);
      setSaveError(`Failed to save set ${setData.setNumber}. Your data is stored locally and will be saved when connection is restored.`);

      // Retry logic: attempt to save again after 3 seconds
      setTimeout(() => {
        saveQueueRef.current.delete(pendingKey);
        saveSetToDatabase(setIndex, setData);
      }, 3000);

    } finally {
      // Remove from queue
      saveQueueRef.current.delete(pendingKey);
      setIsSaving(false);
    }
  };

  /**
   * Handle input changes for set fields
   *
   * This function only updates the local state. The auto-save logic
   * is handled separately by the useEffect hook above, which:
   * - Detects changes by comparing with previous state
   * - Debounces saves (800ms delay)
   * - Handles per-set timers automatically
   *
   * Benefits of this approach:
   * - Clean separation: state updates vs. side effects
   * - Simpler change handler (no save logic here)
   * - useEffect automatically handles cleanup
   * - Easier to understand and maintain
   *
   * @param {number} setIndex - Index of the set being modified
   * @param {string} field - Field name ('weight', 'reps', 'time', 'notes', or 'completed')
   * @param {string} value - New value for the field
   */
  const handleSetChange = (setIndex, field, value) => {
    const updatedSets = [...sets];
    updatedSets[setIndex] = {
      ...updatedSets[setIndex],
      [field]: value
    };
    setSets(updatedSets);
    // Note: Auto-save is handled by useEffect hook monitoring sets state
  };

  const toggleSetCompletion = async (setIndex) => {
    const updatedSets = [...sets];
    updatedSets[setIndex].completed = !updatedSets[setIndex].completed;
    setSets(updatedSets);

    // Save immediately when marking complete/incomplete
    await saveSetToDatabase(setIndex, updatedSets[setIndex]);

    // Check if all sets are completed
    const allCompleted = updatedSets.every(set => set.completed);

    // Notify parent component if provided
    if (onExerciseComplete) {
      onExerciseComplete(assignment.id, allCompleted);
    }
  };

  const handleHeaderClick = (e) => {
    // Prevent any default action and stop all propagation
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.nativeEvent) {
        e.nativeEvent.stopImmediatePropagation();
      }
    }
    setIsExpanded(!isExpanded);
    return false;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-3 sm:mb-4 overflow-hidden">
      {/* Minimized Header - Always Visible */}
      <button
        type="button"
        className="w-full p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition-colors select-none text-left"
        onClick={handleHeaderClick}
      >
        <div className="flex items-start sm:items-center justify-between gap-2">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <span className="text-base sm:text-lg font-semibold text-gray-800 flex-shrink-0">{assignment.order}</span>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">{exercise.name}</h3>
              <p className="text-xs sm:text-sm text-gray-600 truncate">{exercise.muscleGroup?.name || 'General'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-6 text-xs sm:text-sm flex-shrink-0">
            <div className="text-center hidden sm:block">
              <p className="font-semibold text-gray-700">Sets</p>
              <p className="text-gray-600">{assignment.sets}</p>
            </div>
            <div className="text-center hidden sm:block">
              <p className="font-semibold text-gray-700">Reps</p>
              <p className="text-gray-600">{assignment.reps}</p>
            </div>
            <div className="text-center hidden sm:block">
              <p className="font-semibold text-gray-700">Rest</p>
              <p className="text-gray-600">{assignment.restSeconds || assignment.rest || 0}s</p>
            </div>
            {/* Mobile compact info */}
            <div className="sm:hidden text-right text-gray-600">
              <span className="font-medium">{assignment.sets}×{assignment.reps}</span>
            </div>
            <svg
              className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-600 transition-transform flex-shrink-0 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          {/* Track Your Sets Section */}
          <div className="p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-semibold text-gray-800">Track Your Sets</h5>

              {/* Loading existing data */}
              {isLoadingExistingData && (
                <span className="text-xs text-gray-600 flex items-center gap-1">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </span>
              )}

              {/* Saving indicator */}
              {!isLoadingExistingData && isSaving && (
                <span className="text-xs text-blue-600 flex items-center gap-1">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              )}

              {/* Saved successfully */}
              {!isLoadingExistingData && !isSaving && lastSaved && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Saved
                </span>
              )}

              {/* Error indicator */}
              {saveError && (
                <span className="text-xs text-red-600 flex items-center gap-1" title={saveError}>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Save failed (retrying...)
                </span>
              )}
            </div>
            <div className="space-y-3">
              {sets.map((set, setIndex) => (
                <div
                  key={setIndex}
                  className={`p-3 rounded-lg border ${
                    set.completed ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'
                  }`}
                >
                  {/* Mobile Layout - Stacked */}
                  <div className="sm:hidden">
                    {/* Header row with checkbox and set number */}
                    <div className="flex items-center gap-3 mb-2">
                      <input
                        type="checkbox"
                        checked={set.completed}
                        onChange={() => toggleSetCompletion(setIndex)}
                        className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500 cursor-pointer flex-shrink-0"
                      />
                      <span className="font-medium text-gray-700">Set {set.setNumber}</span>
                    </div>

                    {/* Input fields - stacked vertically with labels on top */}
                    {isTimeBased ? (
                      /* Time-based exercises: Show only Time field */
                      <div className="mb-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Time
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="2"
                            value={set.time}
                            onChange={(e) => handleSetChange(setIndex, 'time', e.target.value)}
                            className="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <span className="text-sm text-gray-600">min</span>
                        </div>
                      </div>
                    ) : (
                      /* Weight-based exercises: Show Weight and Reps fields */
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Reps *
                          </label>
                          <input
                            type="text"
                            placeholder="10"
                            value={set.reps}
                            onChange={(e) => handleSetChange(setIndex, 'reps', e.target.value)}
                            className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Weight (kg) *
                          </label>
                          <input
                            type="text"
                            placeholder="10-15"
                            value={set.weight}
                            onChange={(e) => handleSetChange(setIndex, 'weight', e.target.value)}
                            className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <input
                        type="text"
                        placeholder="Optional"
                        value={set.notes}
                        onChange={(e) => handleSetChange(setIndex, 'notes', e.target.value)}
                        className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>

                  {/* Desktop Layout - Single Row */}
                  <div className="hidden sm:flex sm:items-center sm:gap-3">
                    <input
                      type="checkbox"
                      checked={set.completed}
                      onChange={() => toggleSetCompletion(setIndex)}
                      className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500 cursor-pointer flex-shrink-0"
                    />
                    <span className="font-medium text-gray-700 w-16">Set {set.setNumber}</span>

                    {/* Time-based exercises: Show only Time field */}
                    {isTimeBased ? (
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Time:</label>
                        <input
                          type="text"
                          placeholder="2"
                          value={set.time}
                          onChange={(e) => handleSetChange(setIndex, 'time', e.target.value)}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                        <span className="text-sm text-gray-600">min</span>
                      </div>
                    ) : (
                      /* Weight-based exercises: Show Weight and Reps fields */
                      <>
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Weight (kg):</label>
                          <input
                            type="text"
                            placeholder="10-15"
                            value={set.weight}
                            onChange={(e) => handleSetChange(setIndex, 'weight', e.target.value)}
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Reps:</label>
                          <input
                            type="text"
                            placeholder="10"
                            value={set.reps}
                            onChange={(e) => handleSetChange(setIndex, 'reps', e.target.value)}
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>
                      </>
                    )}

                    <div className="flex items-center gap-2 flex-1">
                      <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Notes:</label>
                      <input
                        type="text"
                        placeholder="Optional"
                        value={set.notes}
                        onChange={(e) => handleSetChange(setIndex, 'notes', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Exercise Description Section */}
          <div className="p-4 border-t border-gray-200">
            <h5 className="font-semibold text-gray-800 mb-2">Exercise Description</h5>
            <p className="text-gray-700 mb-4">{exercise.description || 'No description available.'}</p>

            {/* Exercise Steps */}
            {exercise.steps && exercise.steps.length > 0 && (
              <>
                <h5 className="font-semibold text-gray-800 mb-3">How to Perform</h5>
                <ol className="space-y-2">
                  {exercise.steps.map((step, idx) => (
                    <li key={idx} className="flex">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        {idx + 1}
                      </span>
                      <span className="text-gray-700 pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </>
            )}

            {/* YouTube Tutorial Link */}
            {exercise.youtubeUrl && (
              <div className="mt-4">
                <a
                  href={exercise.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
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
      )}
    </div>
  );
}

export default ExerciseTracker;
