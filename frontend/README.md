# Gym Tracker Frontend

React-based frontend for the Gym Tracking application.

## Technology Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router 6** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client for API calls
- **Recharts** - Chart visualization
- **date-fns** - Date utilities

## Project Structure

```
frontend/
├── src/
│   ├── components/       # React components organized by feature
│   │   ├── Dashboard/
│   │   ├── ExerciseLibrary/
│   │   ├── WorkoutPlan/
│   │   ├── Logging/
│   │   ├── Progress/
│   │   └── shared/       # Shared components (Layout, Navbar)
│   ├── services/         # API service layer
│   │   ├── api.js        # Axios configuration
│   │   ├── exerciseService.js
│   │   ├── workoutService.js
│   │   └── progressService.js
│   ├── hooks/            # Custom React hooks (Phase 5)
│   ├── utils/            # Utility functions (Phase 5)
│   ├── App.jsx           # Main app with routing
│   ├── main.jsx          # React entry point
│   └── index.css         # Global styles + Tailwind
├── public/               # Static assets
├── index.html            # HTML template
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── package.json          # Dependencies
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create a `.env` file (optional - defaults to localhost:5000):

```bash
cp .env.example .env
```

Edit `.env` if your backend runs on a different port:

```
VITE_API_URL=http://localhost:5001/api
```

### 3. Start Development Server

```bash
npm run dev
```

The app will open at [http://localhost:5173](http://localhost:5173)

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Service Layer

All API communication is handled through service modules:

### exerciseService

- `getAllExercises()` - Fetch all exercises
- `getExerciseById(id)` - Get single exercise
- `createExercise(data)` - Create new exercise
- `updateExercise(id, data)` - Update exercise
- `deleteExercise(id)` - Delete exercise
- `getAllMuscleGroups()` - Get muscle groups
- `getExercisesByMuscleGroup(id)` - Filter by muscle

### workoutService

- `getActivePlan()` - Get active workout plan
- `createPlan(data)` - Create new plan
- `addDayToPlan(planId, data)` - Add workout day
- `addExerciseToDay(dayId, data)` - Assign exercise
- `getTodayWorkout()` - Get today's workout

### progressService

- `startWorkout(data)` - Start logging workout
- `logSet(workoutLogId, data)` - Log a set
- `completeWorkout(workoutLogId)` - Finish workout
- `getWorkoutHistory(filters)` - Get past workouts
- `getExerciseProgress(exerciseId)` - Track progression

## Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Dashboard | Today's workout overview |
| `/exercises` | ExerciseLibrary | Browse exercises |
| `/plans` | WorkoutPlanList | View all plans |
| `/plans/:id` | WorkoutPlanDetail | Edit specific plan |
| `/log/:dayId` | WorkoutLogger | Log workout |
| `/progress` | Progress | View history & charts |

## Development Status

### Phase 4: Service Layer ✅ (COMPLETED)
- ✅ Axios API client with interceptors
- ✅ Exercise service (8 methods)
- ✅ Workout service (18 methods)
- ✅ Progress service (14 methods)
- ✅ React Router setup
- ✅ Basic component structure
- ✅ Layout and navigation

### Phase 5: Frontend Components (NEXT)
- [ ] Dashboard with today's workout
- [ ] Exercise library with search/filter
- [ ] Workout plan editor
- [ ] Workout logger interface
- [ ] Progress charts and history
- [ ] Custom hooks (useWorkoutPlan, useExercises)
- [ ] Utility functions (date helpers, formatters)

## API Configuration

The Axios client in `src/services/api.js` includes:

- **Base URL**: Configurable via `VITE_API_URL` environment variable
- **Timeout**: 10 seconds
- **Request Interceptor**: Logs requests in dev mode
- **Response Interceptor**: Global error handling
- **Error Handling**: Status-specific error messages

## Styling

Using Tailwind CSS with custom utility classes defined in `index.css`:

- `.btn-primary` - Blue primary button
- `.btn-secondary` - Gray secondary button
- `.btn-danger` - Red danger button
- `.card` - White card with shadow
- `.input-field` - Form input styling
- `.label` - Form label styling

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Next Steps

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Verify navigation works
4. Proceed to Phase 5: Build full components

## Notes

- Backend must be running on port 5000
- Hot Module Replacement (HMR) is enabled
- All components are functional components with hooks
- Placeholder components will be replaced in Phase 5
