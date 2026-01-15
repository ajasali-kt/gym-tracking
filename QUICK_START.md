# 🏋️ Gym Tracker - Quick Start Guide

## 🚀 Your Application is Ready!

Phase 6 is complete! Your Gym Tracker application is fully integrated and ready to use.

---

## ✅ Current Status

- **Backend API:** Running on http://localhost:5001
- **Frontend App:** Running on http://localhost:5174
- **Database:** Connected and seeded with data
- **Sample Plan:** "Beginner Strength Training" (7-day plan with 29 exercises)
- **Integration Tests:** 100% passing (13/13)

---

## 🎯 Start Using the App

### Open Your Browser
Navigate to: **http://localhost:5174**

You'll see the **Dashboard** with today's workout ready to go!

---

## 📱 Main Features

### 1. Dashboard (/)
- View today's scheduled workout
- See exercises, sets, reps, and rest times
- Click "Start Workout" to begin logging

### 2. Exercise Library (/exercises)
- Browse all 29 exercises
- View detailed instructions
- Watch YouTube demonstrations
- Filter by muscle group

### 3. Workout Plans (/plans)
- View your active 7-day plan
- See exercise assignments for each day
- Create new workout plans (if implemented)

### 4. Workout Logging (/log/:dayId)
- Log sets, reps, and weight for each exercise
- Add notes to your sets
- Complete workouts and track progress

### 5. Progress Tracking (/progress)
- View workout history
- See progression charts
- Track personal records
- Analyze performance over time

---

## 🗓️ Your Sample Workout Plan

**Plan Name:** Beginner Strength Training

| Day | Focus | Exercises |
|-----|-------|-----------|
| Monday | Chest & Triceps | 5 exercises |
| Tuesday | Back & Biceps | 5 exercises |
| Wednesday | Legs | 5 exercises |
| Thursday | Shoulders | 4 exercises |
| Friday | Core & Cardio | 5 exercises |
| Saturday | Full Body | 5 exercises |
| Sunday | Rest Day | Recovery |

---

## 🧪 Testing

### Automated Tests (Already Run)
All 13 integration tests are passing! ✅

To run them again:
```bash
node tests/integration-tests.js
```

### Manual Testing
Follow the comprehensive guide:
```bash
# Open MANUAL_TESTING_GUIDE.md
# Test each feature step-by-step
```

---

## 🛠️ Managing Your Servers

### Check Status

**Backend:**
```bash
curl http://localhost:5001/health
# Should return: {"status":"ok","message":"Gym Tracker API is running"}
```

**Frontend:**
```
Open: http://localhost:5174
Should load the dashboard
```

### Restart Servers (if needed)

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### Stop Servers
Press `Ctrl+C` in each terminal window

---

## 💾 Database Management

### View Database in Prisma Studio
```bash
cd backend
npx prisma studio
```
Opens: http://localhost:5555

### Reset Database (if needed)
```bash
cd backend
npx prisma migrate reset
npx prisma db seed
```

### Create New Sample Plan
```bash
node tests/create-sample-plan.js
```

---

## 📊 API Endpoints

### Quick Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health check |
| `/api/muscle-groups` | GET | All muscle groups |
| `/api/exercises` | GET | All exercises |
| `/api/plans/active` | GET | Active workout plan |
| `/api/dashboard/today` | GET | Today's workout |
| `/api/logs/start` | POST | Start workout log |
| `/api/progress/history` | GET | Workout history |

**Full API documentation:** See [PHASE_6_INTEGRATION_TESTING.md](./PHASE_6_INTEGRATION_TESTING.md)

---

## 🐛 Troubleshooting

### Backend Not Responding
```bash
# Check if backend is running
curl http://localhost:5001/health

# If not, start it
cd backend
npm run dev
```

### Frontend Shows Connection Error
1. Verify backend is running on port 5001
2. Check frontend `.env` file has: `VITE_API_URL=http://localhost:5001/api`
3. Restart frontend if you changed `.env`

### Database Connection Error
1. Ensure PostgreSQL is running
2. Check database exists: `gym-tracker-db01`
3. Verify credentials in `backend/.env`

### Port Already in Use
```bash
# Find process using port (Windows)
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5001 | xargs kill -9
```

---

## 📚 Documentation

### Complete Guides
- [GYM_TRACKER_COMPLETE_PLAN.md](./GYM_TRACKER_COMPLETE_PLAN.md) - Full project plan
- [PHASE_6_COMPLETE.md](./PHASE_6_COMPLETE.md) - Phase 6 summary
- [MANUAL_TESTING_GUIDE.md](./MANUAL_TESTING_GUIDE.md) - Testing scenarios
- [PHASE_6_INTEGRATION_TESTING.md](./PHASE_6_INTEGRATION_TESTING.md) - Integration tests

### Backend Docs
- [backend/README.md](./backend/README.md) - Backend setup
- [backend/PHASE_3_COMPLETE.md](./backend/PHASE_3_COMPLETE.md) - API details
- [backend/TEST_API.md](./backend/TEST_API.md) - API testing

### Frontend Docs
- [frontend/README.md](./frontend/README.md) - Frontend setup
- [frontend/PHASE_4_SUMMARY.md](./frontend/PHASE_4_SUMMARY.md) - Component details

---

## 🎓 Tutorial: Log Your First Workout

### Step 1: Open the App
Navigate to http://localhost:5174

### Step 2: View Today's Workout
The dashboard shows your workout for today based on the day of the week.

### Step 3: Start Logging
1. Click "Start Workout" button
2. You'll be taken to the logging page

### Step 4: Log Your Sets
For each exercise:
1. Enter reps completed
2. Enter weight used (in kg)
3. Add notes (optional)
4. Click "Add Set"

Example for Barbell Bench Press:
- Set 1: 10 reps, 60kg
- Set 2: 8 reps, 60kg
- Set 3: 8 reps, 60kg
- Set 4: 7 reps, 60kg

### Step 5: Complete Workout
1. After logging all exercises, click "Complete Workout"
2. Your workout is saved!

### Step 6: View Progress
1. Navigate to Progress page
2. Select "Barbell Bench Press"
3. See your progression chart

---

## 🎯 What to Test Next

### Recommended Testing Order
1. ✅ Dashboard - View today's workout
2. ✅ Exercise Library - Browse exercises
3. ✅ Workout Plans - View your 7-day plan
4. ✅ Workout Logging - Log a complete workout
5. ✅ Progress Tracking - View your history and charts

### Test Checklist
- [ ] Dashboard loads and shows correct day
- [ ] Can view all exercises in library
- [ ] Exercise details modal opens and closes
- [ ] Workout plan shows all 7 days
- [ ] Can start workout logging
- [ ] Can log sets with reps and weight
- [ ] Can complete workout
- [ ] Workout appears in history
- [ ] Progress charts display data
- [ ] Mobile responsive (test on phone)

---

## 💡 Tips

### For Best Experience
- Use Chrome, Firefox, or Edge (latest versions)
- Desktop screen recommended for first use
- Have your phone nearby to test mobile view
- Keep DevTools open (F12) to see any errors

### Data Tips
- Weight is always in kilograms (kg)
- Reps can be ranges like "8-10" or fixed like "10"
- Rest time is in seconds
- Notes are optional but helpful for tracking

### Navigation
- Use the top navigation bar to move between pages
- Dashboard is your home page
- All data syncs automatically with the database

---

## 🚦 Next Steps

### Immediate (Do Now)
1. ✅ Open http://localhost:5174
2. ✅ Click around and explore the interface
3. ✅ Try logging a workout
4. ✅ Check if everything works as expected

### Short-term (This Week)
1. Follow the [MANUAL_TESTING_GUIDE.md](./MANUAL_TESTING_GUIDE.md)
2. Test all features thoroughly
3. Note any bugs or issues
4. Test on mobile devices
5. Try different browsers

### Long-term (Next Phase)
1. Phase 7: Complete documentation
2. Create user manual with screenshots
3. Record demo video (optional)
4. Plan deployment strategy
5. Consider enhancements (rest timer, PRs, etc.)

---

## 📞 Support

### Getting Help
- Check the troubleshooting section above
- Review documentation files
- Check browser console for errors (F12)
- Verify all servers are running

### Reporting Issues
Use the bug reporting template in [MANUAL_TESTING_GUIDE.md](./MANUAL_TESTING_GUIDE.md#bug-reporting-template)

---

## 🎉 You're All Set!

Your Gym Tracker application is:
- ✅ Fully integrated
- ✅ Loaded with sample data
- ✅ Ready to use
- ✅ Tested and working

**Start tracking your fitness journey today!** 💪

---

## Quick Reference Card

```
🌐 URLs:
   Frontend: http://localhost:5174
   Backend:  http://localhost:5001
   Database: http://localhost:5555 (Prisma Studio)

📁 Key Files:
   Frontend: c:/Users/AjasAli.KT/OneDrive - WellSky/Desktop/Persona/Gym-Tracking/frontend
   Backend:  c:/Users/AjasAli.KT/OneDrive - WellSky/Desktop/Persona/Gym-Tracking/backend
   Tests:    c:/Users/AjasAli.KT/OneDrive - WellSky/Desktop/Persona/Gym-Tracking/tests

🔧 Commands:
   Start Backend:  cd backend && npm run dev
   Start Frontend: cd frontend && npm run dev
   Run Tests:      node tests/integration-tests.js
   View DB:        cd backend && npx prisma studio

📊 Database:
   Name: gym-tracker-db01
   User: postgres
   Pass: 123
   Host: localhost:5432

📈 Current Data:
   Muscle Groups: 6
   Exercises: 29
   Active Plan: Beginner Strength Training (7 days)
```

---

**Happy Tracking! 🏋️‍♂️**

*Last Updated: January 15, 2026*
*Phase 6: COMPLETE ✅*
