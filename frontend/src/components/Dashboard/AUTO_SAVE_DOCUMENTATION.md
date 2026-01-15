# ExerciseTracker Auto-Save Documentation

## Overview
The ExerciseTracker component implements an intelligent auto-save system that automatically persists workout set data to the database as users input their workout information. This provides a seamless experience without requiring manual save actions.

## Key Features

### 1. Automatic Saving
- **Trigger Fields**: Auto-save activates when users modify:
  - Weight (kg)
  - Reps (repetitions)
  - Time (minutes, for cardio exercises)
  - Notes (optional text)
- **No Manual Save Required**: Data is automatically saved to the database without any user action
- **Real-time Persistence**: Changes are persisted while the user continues their workout

### 2. Debouncing Mechanism
- **Delay**: 800ms after the last keystroke
- **Purpose**: Prevents excessive API calls while user is actively typing
- **Behavior**:
  - Each keystroke resets the timer
  - Save only triggers after user pauses for 800ms
  - Reduces server load and improves performance

### 3. Visual Feedback System
Users receive clear visual indicators about save status in the top-right corner of the "Track Your Sets" section:

| Status | Icon | Message | Description |
|--------|------|---------|-------------|
| Loading existing data | Spinning circle | "Loading..." | Fetching previously saved workout data |
| Saving in progress | Blue spinning circle | "Saving..." | Data is being sent to the database |
| Save successful | Green checkmark | "Saved" | Data successfully persisted to database |
| Save failed | Red X | "Save failed (retrying...)" | Error occurred, automatic retry in progress |

### 4. Error Handling & Retry Logic
- **Automatic Retry**: If a save fails, the system automatically retries after 3 seconds
- **Local Data Preservation**: Data remains in the component state even if save fails
- **User Notification**: Clear error message indicates save failure and retry status
- **Network Resilience**: Handles network interruptions gracefully

### 5. Queue Management
- **Prevents Concurrent Saves**: Uses `saveQueueRef` to track pending saves per set
- **Per-Set Tracking**: Each set has a unique key (`exerciseId-setIndex`)
- **Duplicate Prevention**: If a save is already in progress for a set, additional requests are queued

## Technical Implementation

### State Management

```javascript
const [isSaving, setIsSaving] = useState(false);           // Tracks if any save is in progress
const [saveError, setSaveError] = useState(null);          // Stores error messages
const [lastSaved, setLastSaved] = useState(null);          // Timestamp of last successful save
const saveTimerRef = useRef({});                           // Per-set debounce timers (object of timers)
const saveQueueRef = useRef(new Map());                    // Tracks pending saves per set
const previousSetsRef = useRef([]);                        // Previous sets state for change detection
```

### Auto-Save Flow (useEffect-based)

```
User types in field (weight/reps/time/notes)
    ↓
handleSetChange() updates local state immediately
    ↓
useEffect detects sets state change
    ↓
Compare current sets with previousSetsRef
    ↓
For each changed set:
    ↓
    Check if weight/reps/time/notes changed
    ↓
    Clear existing timer for that specific set
    ↓
    Set new timer (800ms) for that set
    ↓
    [User continues typing → timer resets for that set]
    ↓
User stops typing for 800ms
    ↓
Timer triggers → saveSetToDatabase(index, setData)
    ↓
Check if save already in progress for this set
    ↓
Mark set as "saving" in queue
    ↓
Parse data (weight ranges, notes formatting)
    ↓
Create/Update database record
    ↓
Update UI with save status
    ↓
Remove from save queue
    ↓
Update previousSetsRef for next comparison
```

### Why useEffect for Auto-Save?

The implementation uses a `useEffect` hook to handle auto-saving, which provides several benefits:

1. **Separation of Concerns**
   - `handleSetChange()` only updates state (single responsibility)
   - `useEffect` handles the side effect of saving to database
   - Cleaner, more maintainable code

2. **Automatic Cleanup**
   - useEffect's cleanup function automatically clears timers on unmount
   - Prevents memory leaks without manual cleanup in handlers

3. **Centralized Save Logic**
   - All auto-save logic in one place
   - Easier to modify debounce delay or save conditions
   - Simpler to test and debug

4. **React Best Practices**
   - Side effects belong in useEffect, not event handlers
   - Follows React's mental model for state changes
   - Better aligned with React's rendering lifecycle

5. **Per-Set Timer Management**
   - Each set has its own timer (index-based keys)
   - Multiple sets can be edited simultaneously
   - Timers don't interfere with each other

### Data Validation

Before saving, the system validates:
1. **Workout Log ID exists**: Ensures there's a workout session to save to
2. **Meaningful data present**: Skips save if all fields are empty
3. **Weight parsing**: Handles ranges (e.g., "10-15") and single values (e.g., "20")
4. **Numeric conversion**: Converts string inputs to appropriate numeric types

### Weight Range Handling

The system intelligently handles weight ranges:
- **Range input** (e.g., "10-15"): Calculates average → (10 + 15) / 2 = 12.5 kg
- **Single value** (e.g., "20"): Uses direct value → 20 kg
- **Storage**: Saves as `weightKg` in database

### Database Operations

#### New Set (no ID)
```javascript
const response = await workoutService.logSet(workoutLogId, {
  exerciseId: exercise.id,
  setNumber: setData.setNumber,
  repsCompleted: parseInt(setData.reps) || 0,
  weightKg: weightValue,
  notes: notesString || null
});
// Update local state with database ID
updatedSets[setIndex].id = response.id;
```

#### Existing Set (has ID)
```javascript
await workoutService.updateSet(setData.id, {
  repsCompleted: payload.repsCompleted,
  weightKg: payload.weightKg,
  notes: payload.notes
});
```

### Notes Field Format

The system formats notes to include time for cardio exercises:
- **Time only**: `"Time: 15 min"`
- **Time + notes**: `"Time: 15 min | Felt great today"`
- **Notes only**: `"Felt great today"`

## Loading Existing Data

### Optimized Data Loading (Prevents N+1 Query Problem)

**Problem**: Previously, if you had 11 exercises, each `ExerciseTracker` component would independently call the API to fetch the workout log, resulting in 11 identical API calls to `/api/logs/11`.

**Solution**: The workout log data is now fetched **once** in the parent `Dashboard` component and passed down as a prop to all `ExerciseTracker` components.

### Architecture

```
Dashboard Component (Parent)
    ↓
Fetches workout log once: /api/logs/11
    ↓
Stores in workoutLogData state
    ↓
Passes to all ExerciseTracker components as prop
    ↓
ExerciseTracker 1 ← workoutLogData
ExerciseTracker 2 ← workoutLogData
ExerciseTracker 3 ← workoutLogData
...
ExerciseTracker 11 ← workoutLogData
```

### When Data is Loaded
- **Dashboard mount**: Fetches workout log once if `workoutLogId` exists
- **Workout start**: Initializes empty `workoutLogData` object
- **ExerciseTracker mount**: Filters pre-fetched data for its specific exercise

### Loading Process
1. **Dashboard** fetches workout log with all exercise logs (once)
2. **Dashboard** stores in `workoutLogData` state
3. **Dashboard** passes `workoutLogData` to each `ExerciseTracker`
4. **ExerciseTracker** filters logs for its specific exercise
5. Map database records to set state
6. Parse notes for time/weight (backwards compatibility)
7. Mark sets as completed if data exists
8. Set `hasLoadedData` flag to prevent re-processing

### Performance Benefits
- **Before**: 11 exercises = 11 API calls
- **After**: 11 exercises = 1 API call
- **Improvement**: 91% reduction in API calls!

### Code Implementation

#### Dashboard.jsx
```javascript
const [workoutLogData, setWorkoutLogData] = useState(null);

// Fetch workout log data once
const existingLog = await workoutService.getTodayWorkoutLog(data.workoutDay.id);
if (existingLog) {
  setWorkoutLogId(existingLog.id);
  const fullLogData = await workoutService.getWorkoutLog(existingLog.id);
  setWorkoutLogData(fullLogData);
}

// Pass to all ExerciseTrackers
<ExerciseTracker
  workoutLogData={workoutLogData}
  // ... other props
/>
```

#### ExerciseTracker.jsx
```javascript
// Use pre-fetched data instead of fetching independently
useEffect(() => {
  if (!workoutLogData || hasLoadedData) return;

  const exerciseLogs = workoutLogData.exerciseLogs?.filter(
    log => log.exerciseId === exercise.id
  ) || [];

  // Process exercise logs...
}, [workoutLogData, exercise.id]);
```

### Backwards Compatibility
The system handles old data formats where weight was stored in notes:
```javascript
// Old format: "Weight: 10 kg | notes"
// New format: weightKg field + separate notes
```

## User Experience Benefits

### 1. No Lost Data
- Auto-save ensures data is never lost due to browser refresh, navigation, or crashes
- Local state updates immediately, save happens in background

### 2. Seamless Workflow
- Users can focus on their workout without thinking about saving
- Natural typing experience without interruptions

### 3. Transparent Status
- Always know if data is saved, saving, or failed
- Clear visual indicators reduce anxiety about data loss

### 4. Network Resilience
- Handles poor network conditions with retry logic
- User can continue working while system retries in background

## Code References

- **Parent Component**: [Dashboard.jsx](Dashboard.jsx)
  - Workout log data fetching: Dashboard.jsx:28-54
  - Passing data to children: Dashboard.jsx:189-196
- **Exercise Tracker**: [ExerciseTracker.jsx](ExerciseTracker.jsx)
  - Load existing data (optimized): ExerciseTracker.jsx:47-121
  - Auto-save useEffect hook: ExerciseTracker.jsx:123-178
  - Save to database function: ExerciseTracker.jsx:180-228
  - Change handler: ExerciseTracker.jsx:230-257
  - Visual feedback: ExerciseTracker.jsx:340-380

## Best Practices for Developers

### 1. Timer Cleanup
Always clean up timers on unmount to prevent memory leaks. With useEffect, this is automatic:
```javascript
useEffect(() => {
  // ... auto-save logic ...

  // Cleanup: Clear all timers on unmount or when dependencies change
  return () => {
    Object.values(saveTimerRef.current).forEach(timer => {
      if (timer) clearTimeout(timer);
    });
  };
}, [sets, workoutLogId, isLoadingExistingData, hasLoadedData]);
```

### 2. Queue Management
Track pending saves to prevent race conditions:
```javascript
const pendingKey = `${exercise.id}-${setIndex}`;
if (saveQueueRef.current.has(pendingKey)) {
  console.log('Save already in progress, queuing...');
  return;
}
```

### 3. Separation of Concerns
Keep event handlers simple - they should only update state:
```javascript
const handleSetChange = (setIndex, field, value) => {
  const updatedSets = [...sets];
  updatedSets[setIndex] = { ...updatedSets[setIndex], [field]: value };
  setSets(updatedSets);
  // Note: Auto-save is handled by useEffect hook monitoring sets state
};
```

Let useEffect handle side effects like saving to database.

### 4. User Feedback
Always provide visual feedback for async operations:
- Show loading state during save
- Show success confirmation
- Show error with actionable message

### 5. Error Recovery
Implement retry logic for transient failures:
```javascript
setTimeout(() => {
  saveQueueRef.current.delete(pendingKey);
  saveSetToDatabase(setIndex, setData);
}, 3000);
```

### 6. Change Detection
Use refs to track previous state for efficient change detection:
```javascript
const previousSetsRef = useRef([]);

// In useEffect:
const hasChanged =
  currentSet.weight !== previousSet.weight ||
  currentSet.reps !== previousSet.reps ||
  currentSet.time !== previousSet.time ||
  currentSet.notes !== previousSet.notes;

// Update ref after processing
previousSetsRef.current = sets;
```

## Future Enhancements

Potential improvements to consider:
1. **Offline Mode**: Queue saves when offline, sync when connection restored
2. **Optimistic Updates**: Show success immediately, rollback on error
3. **Batch Saves**: Group multiple set changes into single API call
4. **Save History**: Track save attempts for debugging
5. **Customizable Debounce**: Allow users to adjust save delay
6. **Conflict Resolution**: Handle concurrent edits from multiple devices

## Troubleshooting

### Data Not Saving
1. Check browser console for errors
2. Verify `workoutLogId` is set
3. Ensure at least one field (weight/reps/time/notes) has data
4. Check network connection

### Duplicate Saves
- Should be prevented by queue management
- If occurring, check `saveQueueRef` logic

### Save Delay Too Long/Short
- Adjust debounce delay in auto-save useEffect (currently 800ms)
- Balance between responsiveness and API call reduction

### Multiple API Calls on Page Load
**Problem**: API being called N times (once per exercise)

**Solution**:
1. Check that `Dashboard` is fetching workout log data once
2. Verify `workoutLogData` is being passed as prop to `ExerciseTracker`
3. Ensure `ExerciseTracker` is using the prop instead of fetching independently
4. Check browser Network tab - should see only 1 call to `/api/logs/{id}` per page load

**What to look for**:
- ✅ Good: 1 call to `/api/logs/11` on page load (regardless of exercise count)
- ❌ Bad: 11 calls to `/api/logs/11` on page load (one per exercise)

### Data Not Loading After Optimization
1. Verify `workoutLogData` prop is not `null` in Dashboard
2. Check console for "Loaded workout log data with exercise logs" message
3. Ensure `exerciseLogs` array exists in `workoutLogData`
4. Verify exercise IDs match between workout log and exercise tracker

## Related Documentation

- Workout Service API: `frontend/src/services/workoutService.js`
- Backend Set Logging: `backend/routes/workoutLogs.js`
- Database Schema: Exercise logs and set data models
