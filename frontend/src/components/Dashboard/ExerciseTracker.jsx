import { useState, useEffect, useRef } from 'react';
import workoutService from '../../services/workoutService';
import { getInvalidInputClass, isValidPositiveInteger } from '../../utils/inputValidation';

const AUTO_SAVE_DEBOUNCE_MS = 800;
const FALLBACK_PREFIX = 'dashboard_unsaved_set';
const MAX_AUTO_RETRIES = 3;
const RETRY_DELAY_MS = 1200;

/**
 * ExerciseTracker Component
 * Unified component for tracking workout exercises with real-time database updates
 * Shows minimized summary by default, expands to show full tracking and exercise details
 *
 * @param {Object} workoutLogData - Pre-fetched workout log data from parent (prevents N+1 API calls)
 */
function ExerciseTracker({ exercise, assignment, workoutLogId, workoutLogData, ensureWorkoutLog }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sets, setSets] = useState(() => {
    const initialSets = [];
    for (let i = 0; i < assignment.sets; i++) {
      initialSets.push({
        id: null, // Will be set when saved to DB
        setNumber: i + 1,
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
  const failedSavesRef = useRef(new Map()); // Persist failed saves for manual retry

  // Determine if this is a time-based exercise
  // Time-based exercises: Cardio, Running, Cycling, Plank, etc.
  const isTimeBased = exercise.category?.toLowerCase() === 'cardio' ||
                      exercise.name?.toLowerCase().includes('run') ||
                      exercise.name?.toLowerCase().includes('plank') ||
                      exercise.name?.toLowerCase().includes('cardio') ||
                      exercise.muscleGroup?.name?.toLowerCase() === 'cardio';

  const parseWeightValue = (weightInput) => {
    if (!weightInput || !weightInput.trim()) return null;
    const normalized = weightInput.trim();
    const single = Number.parseFloat(normalized);
    if (!Number.isFinite(single) || single <= 0) return null;
    return single;
  };

  const parseRepsValue = (repsInput) => {
    const normalized = (repsInput || '').trim();
    if (!isValidPositiveInteger(normalized)) return null;
    const parsed = Number.parseInt(normalized, 10);
    if (!Number.isInteger(parsed) || parsed <= 0) return null;
    return parsed;
  };

  const isSetReadyForAutosave = (setData) => {
    if (isTimeBased) return false;
    return parseRepsValue(setData.reps) !== null && parseWeightValue(setData.weight) !== null;
  };

  const getFallbackStorageKey = (setData, setIndex, activeWorkoutLogId = workoutLogId) =>
    `${FALLBACK_PREFIX}:${activeWorkoutLogId || 'pending'}:${exercise.id}:${setData?.setNumber || setIndex + 1}`;

  const saveFailedSetLocally = (setIndex, setData, activeWorkoutLogId = workoutLogId) => {
    const key = getFallbackStorageKey(setData, setIndex, activeWorkoutLogId);
    failedSavesRef.current.set(key, { setIndex, setData });
    try {
      localStorage.setItem(
        key,
        JSON.stringify({
          exerciseId: exercise.id,
          setIndex,
          setData,
          workoutLogId: activeWorkoutLogId || null,
          savedAt: new Date().toISOString()
        })
      );
    } catch {
      // Ignore storage issues and still keep in-memory fallback.
    }
  };

  const clearFailedSetFallback = (setIndex, setData, activeWorkoutLogId = workoutLogId) => {
    const key = getFallbackStorageKey(setData, setIndex, activeWorkoutLogId);
    failedSavesRef.current.delete(key);
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore storage cleanup issues.
    }
  };

  // Load existing workout data from pre-fetched workoutLogData (passed from parent)
  // This prevents the N+1 query problem where each ExerciseTracker fetches the same workout log
  useEffect(() => {
    // No existing log data to preload for this exercise, so allow autosave immediately.
    if (!workoutLogData) {
      if (!hasLoadedData) {
        setHasLoadedData(true);
      }
      return;
    }

    if (hasLoadedData) return;

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
  }, [workoutLogData, exercise.id, hasLoadedData]);

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
        if (!isSetReadyForAutosave(currentSet)) {
          if (saveTimerRef.current[index]) {
            clearTimeout(saveTimerRef.current[index]);
            delete saveTimerRef.current[index];
          }
          return;
        }

        // Clear existing timer for this specific set
        if (saveTimerRef.current[index]) {
          clearTimeout(saveTimerRef.current[index]);
        }

        // Debounce: Set new timer for this set
        // Wait 800ms after user stops typing before saving
        saveTimerRef.current[index] = setTimeout(() => {
          saveSetToDatabase(index, currentSet);
          delete saveTimerRef.current[index];
        }, AUTO_SAVE_DEBOUNCE_MS);
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
   * - Validates reps and weight before sending requests
   * - Auto-retries failed saves up to 3 times before local fallback storage
   * - Visual feedback for save status
   */
  const saveSetToDatabase = async (setIndex, setData, attempt = 1) => {
    const activeWorkoutLogId = workoutLogId || (ensureWorkoutLog ? await ensureWorkoutLog() : null);
    if (!activeWorkoutLogId) {
      return;
    }

    if (!isSetReadyForAutosave(setData)) {
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

      const repsValue = parseRepsValue(setData.reps);
      const weightValue = parseWeightValue(setData.weight);
      if (repsValue === null || weightValue === null) {
        return;
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
        repsCompleted: repsValue,
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
      } else {
        const response = await workoutService.logSet(activeWorkoutLogId, payload);
        // Update the set with the database ID
        setSets((previousSets) => {
          const updatedSets = [...previousSets];
          if (updatedSets[setIndex]) {
            updatedSets[setIndex] = { ...updatedSets[setIndex], id: response.id };
          }
          return updatedSets;
        });
      }

      // Update last saved timestamp
      setLastSaved(new Date());
      clearFailedSetFallback(setIndex, setData, activeWorkoutLogId);

    } catch (error) {
      console.error(`Error saving set ${setData.setNumber}:`, error);
      if (attempt < MAX_AUTO_RETRIES) {
        setSaveError(`Save failed for set ${setData.setNumber}. Retrying (${attempt}/${MAX_AUTO_RETRIES})...`);
        setTimeout(() => {
          saveSetToDatabase(setIndex, setData, attempt + 1);
        }, RETRY_DELAY_MS);
      } else {
        saveFailedSetLocally(setIndex, setData, activeWorkoutLogId);
        setSaveError(`Failed to save set ${setData.setNumber} after ${MAX_AUTO_RETRIES} attempts. Changes stored locally.`);
      }

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
   * @param {string} field - Field name ('weight', 'reps', 'time', or 'notes')
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

  const handleAddSet = () => {
    setSets((previousSets) => [
      ...previousSets,
      {
        id: null,
        setNumber: (previousSets[previousSets.length - 1]?.setNumber || 0) + 1,
        reps: '',
        time: '',
        weight: '',
        notes: ''
      }
    ]);
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

  const assignmentIdToken = assignment.id ?? assignment.order;

  return (
    <div className="card mb-3 sm:mb-4 overflow-hidden">
      {/* Minimized Header - Always Visible */}
      <button
        id={`exercise-tracker-${assignmentIdToken}-toggle-button`}
        type="button"
        className="w-full p-3 sm:p-4 cursor-pointer hover:bg-surface transition-colors select-none text-left"
        onClick={handleHeaderClick}
      >
        <div className="flex items-start sm:items-center justify-between gap-2">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <span className="text-base sm:text-lg font-semibold text-app-primary flex-shrink-0">{assignment.order}</span>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-app-primary truncate">{exercise.name}</h3>
              <p className="text-xs sm:text-sm text-app-muted truncate">{exercise.muscleGroup?.name || 'General'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-6 text-xs sm:text-sm flex-shrink-0">
            <div className="text-center hidden sm:block">
              <p className="font-semibold text-app-primary">Sets</p>
              <p className="text-app-muted">{assignment.sets}</p>
            </div>
            <div className="text-center hidden sm:block">
              <p className="font-semibold text-app-primary">Reps</p>
              <p className="text-app-muted">{assignment.reps}</p>
            </div>
            <div className="text-center hidden sm:block">
              <p className="font-semibold text-app-primary">Rest</p>
              <p className="text-app-muted">{assignment.restSeconds || assignment.rest || 0}s</p>
            </div>
            {/* Mobile metrics */}
            <div className="sm:hidden text-right">
              <div className="grid grid-cols-3 gap-2 text-[11px] text-app-muted">
                <div>
                  <p className="font-semibold text-app-primary leading-tight">Sets</p>
                  <p className="leading-tight">{assignment.sets}</p>
                </div>
                <div>
                  <p className="font-semibold text-app-primary leading-tight">Reps</p>
                  <p className="leading-tight">{assignment.reps}</p>
                </div>
                <div>
                  <p className="font-semibold text-app-primary leading-tight">Rest</p>
                  <p className="leading-tight">{assignment.restSeconds || assignment.rest || 0}s</p>
                </div>
              </div>
            </div>
            <svg
              className={`w-5 h-5 sm:w-6 sm:h-6 text-app-muted transition-transform flex-shrink-0 ${
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
        <div className="border-t border-app-subtle">
          {/* Track Your Sets Section */}
          <div className="p-4 bg-card">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-lg font-semibold text-app-primary">Track Your Sets</h5>

              {/* Loading existing data */}
              {isLoadingExistingData && (
                <span className="text-xs text-app-muted flex items-center gap-1">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </span>
              )}

              {/* Saving indicator */}
              {!isLoadingExistingData && isSaving && (
                <span className="text-xs text-blue-300 flex items-center gap-1">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              )}

              {/* Saved successfully */}
              {!isLoadingExistingData && !isSaving && lastSaved && (
                <span className="text-xs text-green-300 flex items-center gap-1">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Saved
                </span>
              )}

              {/* Error indicator */}
              {saveError && (
                <span className="text-xs text-red-300 flex items-center gap-1" title={saveError}>
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {saveError}
                </span>
              )}
            </div>
            {!isTimeBased && (
              <div className="grid grid-cols-12 gap-2 px-2 pb-2 text-[11px] uppercase tracking-[0.1em] text-app-muted sm:text-xs">
                <div className="col-span-1 sm:col-span-1">Set</div>
                <div className="col-span-3 sm:col-span-2">Reps</div>
                <div className="col-span-3 sm:col-span-2">Weight</div>
                <div className="col-span-5 sm:col-span-7">Notes (Optional)</div>
              </div>
            )}

            <div className="space-y-2">
              {sets.map((set, setIndex) => (
                (() => {
                  const isRepsInvalid = !!set.reps && parseRepsValue(set.reps) === null;
                  return (
                <div
                  key={setIndex}
                  className="group grid grid-cols-12 items-center gap-1.5 sm:gap-2 rounded-xl border border-app-subtle bg-surface px-2 py-2 transition hover:border-blue-500/40"
                >
                  <div className="col-span-1 sm:col-span-1 flex items-center text-xs sm:text-sm text-app-muted whitespace-nowrap">
                    <span className="sm:hidden">S{set.setNumber}</span>
                    <span className="hidden sm:inline">Set {set.setNumber}</span>
                  </div>

                  {/* Time-based exercises: keep one row on mobile and desktop */}
                  {isTimeBased ? (
                    <>
                      <div className="col-span-4 sm:col-span-4 flex items-center gap-1 sm:gap-2">
                        <input
                          type="text"
                          placeholder="2"
                          value={set.time}
                          onChange={(e) => handleSetChange(setIndex, 'time', e.target.value)}
                          className="input-field w-full text-sm !px-2 !py-2"
                        />
                        <span className="text-sm text-app-muted">min</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Optional"
                        value={set.notes}
                        onChange={(e) => handleSetChange(setIndex, 'notes', e.target.value)}
                        className="col-span-7 input-field text-sm !px-2 !py-2"
                      />
                    </>
                  ) : (
                    <>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Reps"
                        value={set.reps}
                        onChange={(e) => handleSetChange(setIndex, 'reps', e.target.value)}
                        inputMode="numeric"
                        className={`col-span-3 sm:col-span-2 input-field text-sm !px-2 !py-2 ${getInvalidInputClass(isRepsInvalid)}`}
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Kg"
                        value={set.weight}
                        onChange={(e) => handleSetChange(setIndex, 'weight', e.target.value)}
                        inputMode="decimal"
                        className="col-span-3 sm:col-span-2 input-field text-sm !px-2 !py-2"
                      />
                      <input
                        type="text"
                        placeholder="Optional"
                        value={set.notes}
                        onChange={(e) => handleSetChange(setIndex, 'notes', e.target.value)}
                        className="col-span-5 sm:col-span-7 input-field text-sm !px-2 !py-2"
                      />
                    </>
                  )}
                </div>
                  );
                })()
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <button
                id={`exercise-tracker-${assignmentIdToken}-add-set-button`}
                type="button"
                onClick={handleAddSet}
                className="btn-outline"
              >
                + Add Set
              </button>
            </div>
          </div>

          {/* Exercise Description Section */}
          <div className="p-4 border-t border-app-subtle">
            <h5 className="font-semibold text-app-primary mb-2">Exercise Description</h5>
            <p className="mb-4 text-app-muted">{exercise.description || 'No description available.'}</p>

            {/* Exercise Steps */}
            {exercise.steps && exercise.steps.length > 0 && (
              <>
                <h5 className="font-semibold text-app-primary mb-3">How to Perform</h5>
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
              </>
            )}

            {/* YouTube Tutorial Link */}
            {exercise.youtubeUrl && (
              <div className="mt-4">
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
      )}
    </div>
  );
}

export default ExerciseTracker;



