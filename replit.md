# Eu me treino

A mobile fitness app built with Expo (React Native) that generates personalized workout plans based on the user's home exercise equipment.

## Architecture

- **Frontend**: Expo Router (file-based routing) with React Native
- **Backend**: Express.js server on port 5000 (serves landing page and API)
- **State**: AsyncStorage for local data persistence, React Context for shared state
- **Styling**: Dark theme with green/teal gradient accents, Rubik font family

## App Flow

1. Splash Screen -> Onboarding (3 slides) -> Login/Register
2. Level Selection (Beginner/Intermediate/Advanced) -> Equipment Capture
3. AI Processing animation -> Workout Result
4. Main App (Home, Equipment Management, Profile tabs)

## Key Files

- `app/_layout.tsx` - Root layout with providers (QueryClient, AppContext, fonts)
- `app/index.tsx` - Splash screen with auto-routing logic
- `app/onboarding/index.tsx` - 3-slide onboarding
- `app/(auth)/login.tsx` & `register.tsx` - Auth screens
- `app/level-select.tsx` - Experience level selection
- `app/equipment-capture.tsx` - Equipment photo/selection screen
- `app/processing.tsx` - AI processing animation
- `app/workout-result.tsx` - Generated workout display
- `app/(tabs)/index.tsx` - Home screen with today's workout
- `app/(tabs)/add-equipment.tsx` - Equipment management
- `app/(tabs)/profile.tsx` - User profile
- `contexts/AppContext.tsx` - Global state management
- `lib/storage.ts` - AsyncStorage CRUD operations
- `lib/workout-generator.ts` - Workout generation algorithm
- `constants/colors.ts` - Theme colors

## Dependencies

- expo-camera, expo-image-picker for equipment photos
- @expo-google-fonts/rubik for typography
- expo-linear-gradient for gradient UI elements
- expo-haptics for tactile feedback
- @react-native-async-storage/async-storage for data persistence
- NativeTabs with liquid glass support for iOS 26+
