# Manual Testing Guide - Gym Tracker Application

## Quick Start

### Prerequisites
- Backend server running on: http://localhost:5001
- Frontend server running on: http://localhost:5174
- Sample workout plan created (use `node tests/create-sample-plan.js`)

---

## Test Scenario 1: Dashboard View

### Steps:
1. Open browser and navigate to: http://localhost:5174
2. You should see the **Dashboard** page

### Expected Results:
- ✅ Page loads without errors
- ✅ Shows "Today's Workout" section
- ✅ Displays the workout for the current day of the week:
  - Monday (Day 1): Chest & Triceps
  - Tuesday (Day 2): Back & Biceps
  - Wednesday (Day 3): Legs
  - Thursday (Day 4): Shoulders
  - Friday (Day 5): Core & Cardio
  - Saturday (Day 6): Full Body
  - Sunday (Day 7): Rest Day
- ✅ Shows muscle group icon/name
- ✅ Lists all exercises for today with:
  - Exercise name
  - Sets count
  - Reps range
  - Rest time
- ✅ "Start Workout" button is visible
- ✅ No console errors in browser DevTools (F12)

### Screenshots to Take:
- Dashboard with today's workout displayed

---

## Test Scenario 2: Exercise Library

### Steps:
1. Click on "Exercise Library" in the navigation
2. Browse through the exercises

### Expected Results:
- ✅ Page shows all 29 exercises
- ✅ Exercises are organized by muscle group:
  - Chest: 4 exercises
  - Back: 5 exercises
  - Legs: 6 exercises
  - Shoulders: 4 exercises
  - Arms: 5 exercises
  - Core: 5 exercises
- ✅ Each exercise card shows:
  - Exercise name
  - Muscle group
  - Brief description
  - Number of steps
- ✅ Click on an exercise opens detail modal
- ✅ Modal shows:
  - Full description
  - Step-by-step instructions
  - YouTube video (if available)
  - Close button works

### Test Specific Exercises:
1. **Barbell Bench Press** (Chest)
   - Should have 6 instruction steps
   - Should show Chest as muscle group

2. **Barbell Squat** (Legs)
   - Should have detailed form instructions
   - Should show Legs as muscle group

3. **Plank** (Core)
   - Should show time-based instructions
   - Should show Core as muscle group

### Screenshots to Take:
- Exercise library page
- Exercise detail modal

---

## Test Scenario 3: Workout Plans

### Steps:
1. Click on "Workout Plans" in navigation
2. View the "Beginner Strength Training" plan

### Expected Results:
- ✅ Page shows the active workout plan
- ✅ Plan name: "Beginner Strength Training"
- ✅ Plan is marked as "Active"
- ✅ Shows all 7 days of the week
- ✅ Each day shows:
  - Day number and name
  - Muscle group focus
  - Number of exercises
- ✅ Can expand each day to see exercise details
- ✅ Each exercise shows: sets, reps, rest time

### Test Each Day:
1. **Day 1: Chest & Triceps**
   - Should have 5 exercises
   - Should include: Bench Press, Incline DB Press, Cable Flyes, Tricep Dips, Tricep Pushdown

2. **Day 2: Back & Biceps**
   - Should have 5 exercises
   - Should include: Deadlift, Barbell Rows, Pull-ups, Barbell Curl, Hammer Curl

3. **Day 3: Legs**
   - Should have 5 exercises
   - Should include: Squat, Leg Press, Romanian Deadlift, Leg Curl, Calf Raises

4. **Day 4: Shoulders**
   - Should have 4 exercises
   - Should include: Overhead Press, Lateral Raises, Front Raises, Face Pulls

5. **Day 5: Core & Cardio**
   - Should have 5 exercises
   - Should include: Plank, Crunches, Russian Twists, Hanging Leg Raises, Mountain Climbers

6. **Day 6: Full Body**
   - Should have 5 exercises
   - Should include mix of all muscle groups

7. **Day 7: Rest Day**
   - Should have 0 exercises
   - Should show "Rest Day" or similar message

### Additional Tests:
- ✅ Can click "Edit Plan" (if implemented)
- ✅ Can add new exercises to a day (if implemented)
- ✅ Can reorder exercises (if implemented)
- ✅ Can delete exercises from a day (if implemented)
- ✅ Can create a new plan (if implemented)

### Screenshots to Take:
- Workout plan overview
- Expanded day view with exercises

---

## Test Scenario 4: Workout Logging

### Steps:
1. From Dashboard, click "Start Workout"
2. Log your workout sets

### Expected Results:
- ✅ Redirects to workout logging page
- ✅ Shows all exercises for today's workout
- ✅ Each exercise has input fields for:
  - Set number (auto-incremented)
  - Reps completed
  - Weight (kg)
  - Notes (optional)
- ✅ Can add multiple sets per exercise
- ✅ "Add Set" button works
- ✅ "Remove Set" button works (if implemented)
- ✅ Data is validated (numbers only for reps/weight)

### Sample Logging Session:

**Exercise 1: Barbell Bench Press (4 sets planned)**
- Set 1: 10 reps, 60kg, Note: "Warm-up"
- Set 2: 8 reps, 70kg
- Set 3: 8 reps, 70kg
- Set 4: 7 reps, 70kg, Note: "Last rep was hard"

**Exercise 2: Incline Dumbbell Press (3 sets planned)**
- Set 1: 12 reps, 20kg
- Set 2: 10 reps, 20kg
- Set 3: 10 reps, 20kg

Continue for remaining exercises...

### After Logging:
- ✅ Click "Complete Workout"
- ✅ Confirm dialog appears (if implemented)
- ✅ Workout is saved to database
- ✅ Redirects to progress/summary page
- ✅ Can view completed workout details

### Screenshots to Take:
- Workout logging interface
- Logged sets with data
- Completion confirmation

---

## Test Scenario 5: Progress Tracking

### Steps:
1. Navigate to "Progress" page
2. View workout history and charts

### Expected Results:
- ✅ Page shows workout history
- ✅ Can see list of past workouts with dates
- ✅ Can click on a workout to view details
- ✅ Workout details show:
  - Date
  - All exercises performed
  - All sets with reps and weight
  - Notes

### Exercise Progress:
- ✅ Can select specific exercise
- ✅ Chart displays progression over time
- ✅ Chart shows:
  - X-axis: Date
  - Y-axis: Weight (kg) or Reps
  - Data points for each workout
  - Trend line (if implemented)
- ✅ Can filter by date range
- ✅ Can view table of all logged sets

### Test with Barbell Bench Press:
1. Select "Barbell Bench Press" from exercise dropdown
2. View progression chart
3. Verify data matches logged workouts
4. Check if personal record (PR) is highlighted

### Screenshots to Take:
- Workout history page
- Exercise progression chart
- Workout detail view

---

## Test Scenario 6: Mobile Responsiveness

### Steps:
1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M or Cmd+Shift+M)
3. Test different screen sizes

### Screen Sizes to Test:

#### Mobile (375x667 - iPhone SE)
- ✅ Navigation collapses to hamburger menu
- ✅ Content fits in single column
- ✅ Text is readable without zooming
- ✅ Buttons are large enough to tap (min 44x44px)
- ✅ Forms are easy to fill
- ✅ No horizontal scrolling

#### Tablet (768x1024 - iPad)
- ✅ Layout uses available space efficiently
- ✅ Cards/exercises display in grid (2 columns)
- ✅ Touch targets are appropriate size
- ✅ Navigation is accessible

#### Desktop (1920x1080)
- ✅ Content is centered or uses max-width
- ✅ Doesn't look stretched or cramped
- ✅ Hover effects work on interactive elements
- ✅ Modal dialogs are appropriately sized

### Screenshots to Take:
- Mobile view of dashboard
- Tablet view of exercise library
- Desktop view of workout plan

---

## Test Scenario 7: Error Handling

### Test Cases:

#### 1. Backend Offline
**Steps:**
1. Stop the backend server (Ctrl+C in terminal)
2. Try to load any page in frontend
3. Try to submit a form

**Expected:**
- ✅ Shows error message: "Unable to connect to server"
- ✅ Doesn't crash the app
- ✅ Error message is user-friendly

#### 2. Invalid Data
**Steps:**
1. Try to log a set with negative weight
2. Try to enter text in weight field
3. Try to submit without required fields

**Expected:**
- ✅ Validation errors appear
- ✅ Form doesn't submit
- ✅ Clear error messages guide user

#### 3. Network Error
**Steps:**
1. Open DevTools > Network tab
2. Throttle to "Slow 3G"
3. Try to load pages and submit forms

**Expected:**
- ✅ Loading indicators appear
- ✅ Reasonable timeout handling
- ✅ Retry options (if implemented)

---

## Test Scenario 8: Data Persistence

### Steps:
1. Log a complete workout
2. Close the browser
3. Reopen browser and navigate to app
4. Check if data persists

**Expected:**
- ✅ Workout plan is still active
- ✅ Logged workouts appear in history
- ✅ Exercise progress charts show all data
- ✅ No data loss

---

## Test Scenario 9: API Endpoint Testing

### Using curl or Postman:

#### Get Today's Workout
```bash
curl http://localhost:5001/api/dashboard/today
```

#### Get Active Plan
```bash
curl http://localhost:5001/api/plans/active
```

#### Get All Exercises
```bash
curl http://localhost:5001/api/exercises
```

#### Get Workout History
```bash
curl http://localhost:5001/api/progress/history?limit=10
```

#### Get Exercise Progress
```bash
curl http://localhost:5001/api/progress/exercise/1?limit=10
```

---

## Browser Compatibility Testing

### Test on Multiple Browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest) - if on Mac
- [ ] Edge (latest)

### Check for:
- ✅ Layout renders correctly
- ✅ All features work
- ✅ No browser-specific bugs
- ✅ Console has no errors

---

## Performance Testing

### Page Load Times:
- [ ] Dashboard: < 2 seconds
- [ ] Exercise Library: < 3 seconds
- [ ] Workout Plans: < 2 seconds
- [ ] Progress Charts: < 3 seconds

### API Response Times:
- [ ] GET requests: < 200ms
- [ ] POST requests: < 500ms
- [ ] Complex queries: < 1 second

### Check in DevTools:
1. Open Performance tab
2. Record page load
3. Analyze metrics:
   - First Contentful Paint (FCP)
   - Time to Interactive (TTI)
   - Total Blocking Time (TBT)

---

## Accessibility Testing

### Keyboard Navigation:
- [ ] Can navigate entire app with Tab key
- [ ] Focus indicators are visible
- [ ] Can submit forms with Enter key
- [ ] Can close modals with Escape key

### Screen Reader:
- [ ] Alt text on images
- [ ] Proper heading hierarchy (h1, h2, h3)
- [ ] Form labels are associated with inputs
- [ ] Error messages are announced

### Color Contrast:
- [ ] Text has sufficient contrast ratio (4.5:1 minimum)
- [ ] Interactive elements are distinguishable
- [ ] Doesn't rely solely on color for information

---

## Bug Reporting Template

When you find a bug, document it like this:

```
## Bug: [Short Description]

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Screenshots:**
[Attach screenshots]

**Environment:**
- Browser: Chrome 120
- OS: Windows 11
- Screen Size: 1920x1080
- Date: 2026-01-15

**Console Errors:**
[Paste any console errors]

**Additional Notes:**
Any other relevant information
```

---

## Testing Checklist Summary

### Core Functionality
- [ ] Dashboard displays today's workout
- [ ] Exercise library shows all exercises
- [ ] Workout plans are viewable and editable
- [ ] Can log workouts successfully
- [ ] Progress tracking shows historical data
- [ ] Charts render correctly

### User Experience
- [ ] Navigation is intuitive
- [ ] Forms are easy to use
- [ ] Error messages are helpful
- [ ] Loading states are clear
- [ ] Success confirmations appear

### Technical
- [ ] No console errors
- [ ] API calls succeed
- [ ] Data persists correctly
- [ ] Mobile responsive
- [ ] Cross-browser compatible
- [ ] Performance is acceptable

### Edge Cases
- [ ] Handles backend offline gracefully
- [ ] Validates user input
- [ ] Handles empty states
- [ ] Works with slow network
- [ ] Handles large datasets

---

## Automated Testing (Future)

For Phase 7+, consider adding:

### Unit Tests
- Component rendering tests
- Utility function tests
- API service tests

### Integration Tests
- User flow tests
- API endpoint tests
- Database tests

### E2E Tests (Cypress/Playwright)
- Complete user journeys
- Critical paths
- Regression tests

---

## Test Results Log

Document your testing results:

| Date | Tester | Feature | Status | Issues Found | Notes |
|------|--------|---------|--------|--------------|-------|
| 2026-01-15 | | Dashboard | ✅ Pass | 0 | All features working |
| 2026-01-15 | | Exercise Library | ⏳ Pending | - | Not yet tested |
| 2026-01-15 | | Workout Plans | ⏳ Pending | - | Not yet tested |
| 2026-01-15 | | Workout Logging | ⏳ Pending | - | Not yet tested |
| 2026-01-15 | | Progress Tracking | ⏳ Pending | - | Not yet tested |

---

## Next Steps After Testing

1. **Document all bugs** in a tracking system or spreadsheet
2. **Prioritize fixes** by severity and impact
3. **Create tickets** for each bug or enhancement
4. **Test fixes** to ensure they work
5. **Re-test** related features to avoid regressions
6. **Update documentation** based on actual behavior
7. **Plan Phase 7** - Final documentation and deployment

---

**Happy Testing! 💪**

For questions or issues, refer to:
- [PHASE_6_INTEGRATION_TESTING.md](./PHASE_6_INTEGRATION_TESTING.md)
- [GYM_TRACKER_COMPLETE_PLAN.md](./GYM_TRACKER_COMPLETE_PLAN.md)
