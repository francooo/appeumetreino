# Eu me treino

A mobile fitness app built with Expo (React Native) that generates personalized workout plans based on the user's home exercise equipment.

## Architecture

- **Frontend**: Expo Router (file-based routing) with React Native
- **Backend**: Express.js server on port 5000 (serves landing page and API)
- **Database**: Neon PostgreSQL (via NEON_DATABASE_URL secret), Drizzle ORM
- **State**: AsyncStorage for local cache + backend API for persistence, React Context for shared state
- **Auth**: Email/password (bcrypt hashing) + Google Sign-In (expo-auth-session)
- **Styling**: Dark theme with green/teal gradient accents, Rubik font family

## Database Tables

- `users` - id (UUID), name, email, password (bcrypt hash), google_id, level, created_at
- `equipment` - id (UUID), user_id (FK), name, image_uri, added_at
- `workouts` - id (UUID), user_id (FK), name, exercises (JSONB), level, duration, created_at
- `workout_history` - id (UUID), user_id (FK), workout_id, workout_name, completed_at, duration

## API Endpoints

- `POST /api/auth/register` - Create account (name, email, password)
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Google Sign-In (name, email, googleId)
- `GET /api/user/:id` - Get user profile
- `PUT /api/user/:id/level` - Update experience level
- `GET/POST /api/user/:id/equipment` - List/add equipment
- `DELETE /api/user/:userId/equipment/:id` - Remove equipment
- `GET/POST /api/user/:id/workouts` - List/save workouts
- `GET/POST /api/user/:id/history` - List/add workout history
- `GET /api/health` - Health check with DB status

## App Flow

1. Splash Screen -> Onboarding (3 slides) -> Login/Register
2. Level Selection (Beginner/Intermediate/Advanced) -> Equipment Capture
3. AI Processing animation -> Workout Result
4. Main App (Home, Equipment Management, Profile tabs)

## Key Files

- `app/_layout.tsx` - Root layout with providers (QueryClient, AppContext, fonts)
- `app/index.tsx` - Splash screen with auto-routing logic
- `app/onboarding/index.tsx` - 3-slide onboarding
- `app/(auth)/login.tsx` & `register.tsx` - Auth screens (backend-connected)
- `app/level-select.tsx` - Experience level selection
- `app/equipment-capture.tsx` - Equipment photo/selection screen
- `app/processing.tsx` - AI processing animation
- `app/workout-result.tsx` - Generated workout display
- `app/(tabs)/index.tsx` - Home screen with today's workout
- `app/(tabs)/add-equipment.tsx` - Equipment management
- `app/(tabs)/profile.tsx` - User profile
- `contexts/AppContext.tsx` - Global state management (backend + local cache)
- `lib/storage.ts` - AsyncStorage CRUD operations (local cache)
- `lib/query-client.ts` - API request helpers
- `lib/workout-generator.ts` - Workout generation algorithm
- `constants/colors.ts` - Theme colors
- `shared/schema.ts` - Drizzle ORM schema definitions
- `server/db.ts` - Database connection (Neon PostgreSQL)
- `server/storage.ts` - Database CRUD operations
- `server/routes.ts` - Express API routes

## Dependencies

- expo-camera, expo-image-picker for equipment photos
- @expo-google-fonts/rubik for typography
- expo-linear-gradient for gradient UI elements
- expo-haptics for tactile feedback
- @react-native-async-storage/async-storage for local data cache
- NativeTabs with liquid glass support for iOS 26+
- bcryptjs for password hashing
- expo-auth-session, expo-crypto for Google Sign-In
- drizzle-orm, pg for database access
