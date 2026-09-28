# Domestic Care Services

An Expo and React Native application prototype for discovering domestic-care services, posting service requests, and connecting clients with providers. Firebase supplies authentication and the app's client-side data operations.

This repository demonstrates mobile UI and Firebase workflows. It does not include Firebase Security Rules, trusted server-side authorization, payment processing, or a production live-location pipeline. Do not deploy it with real user or identity data until the security work described below is complete.

## Implemented Features

- Email/password account registration, sign-in, sign-out, and Firebase Auth state persistence through AsyncStorage.
- Firebase Auth email-verification links. The app blocks non-admin users from the main flow until Firebase reports the signed-in account as verified.
- Firestore-backed service catalog lookup with client-side name filtering and provider lookup by service skill.
- Client service requests with start/end time fields, address, comments, and an estimated budget; providers can submit or revise bids, and clients can accept a bid to create a booking. The form does not provide a calendar date selector.
- Client request and booking lists, provider assigned-job lists, and a provider action to mark a confirmed booking complete.
- Provider profile editing, skill selection, availability selection, and identity-document submission for review.
- Provider reviews stored in Firestore and displayed in the app. Provider ratings are calculated from fetched reviews.
- A Firestore snapshot listener and message writes for request/provider chat rooms.
- A provider-approval dashboard for accounts whose admin role is stored in the Firestore profile.
- Image selection and compression for profile and identity images. The resulting Base64 data URI is written into the Firestore user profile; this is not a Firebase Storage upload.
- Static client/provider FAQ content.

## Partial, Mock, and Unavailable Features

- **Email verification, not OTP:** the custom OTP mechanism has been replaced with Firebase Auth email verification. No numeric OTP is sent or checked by this app.
- The login screen's **Forgot Password?** control is not connected to a password-reset flow.
- **Role security is client-side only:** navigation uses the authenticated user and the `users/{uid}` profile role. This is UI routing, not authorization. Backend rules must enforce roles and record ownership.
- **Chat is partially complete:** messages are persisted in Firestore and delivered to active listeners in real time. The app does not verify participants itself; access depends on Firestore Rules. New bookings retain their originating request ID for the shared chat room. Older bookings may fall back to a booking-ID room.
- **Live tracking is a placeholder:** the screen listens to `providerLocations/{providerId}` in Realtime Database and displays received coordinates as text. There is no map, in-app location publisher, ETA service, or real SOS dispatch. The destination is a fixed example coordinate.
- **Payments are not implemented:** `src/api/paymentService.js` is a commented placeholder and is unused.
- **Support is partial:** FAQs are static, and some instructions describe provider selection, cancellations, and a live map that the current app does not provide. Chatbot, call-center, and ticket actions are not wired; the chatbot and ticket screen files are empty. Notifications and settings are also placeholders.
- **Image persistence is not Storage-backed:** Base64 images are written to Firestore profile fields. This is unsuitable for sensitive identity documents without strict access rules and a reviewed storage design.
- Promo copy and estimated service rates are UI values, not a pricing or promotion backend.

## Roles and Flows

### Client

Clients register as a client, verify the account through Firebase's email link, search the Firestore `Services` collection, and post a request. Providers can bid on open requests; accepting a bid creates a `bookings` document. Clients can review a completed booking or mark the rating as skipped.

### Provider

Providers register through the same form with the provider option selected. They can save skills and availability, submit identity details for review, browse open requests, and submit or revise bids. The dashboard lists assigned bookings and can mark confirmed bookings complete. The UI hides bidding and job screens until the profile indicates approval, but Firebase Rules must independently enforce this policy.

### Admin

The admin dashboard queries provider profiles with `verificationStatus: pending` and can set their status to approved or rejected. The app determines this route from the profile role in Firestore. There is no server-side admin API or authorization policy in this repository, so the dashboard must not be considered secure until Firebase Rules or a trusted backend enforce admin-only reads and writes.

## Technology

- Expo SDK `54.0.21` (manifest range `~54.0.18`)
- React Native `0.81.4`
- React `19.1.0`
- React Navigation `7.x` (native stack and bottom tabs)
- Firebase JavaScript SDK `12.5.0` (manifest range `^12.4.0`)
- Firebase Authentication, Cloud Firestore, Realtime Database
- AsyncStorage-backed Firebase Auth persistence
- Expo Image Picker and Image Manipulator

## Architecture

```text
Expo / React Native screens and navigation
                 |
       authService / profileService / bookingService / imageService
                 |
   Firebase Authentication | Cloud Firestore | Realtime Database
                                |
             users, Services, serviceRequests, bookings, reviews
             serviceRequests/{requestId}/chats/{providerId}/messages
```

Firebase Storage is initialized in the Firebase module but no app flow uploads to it. The app has no Firebase Cloud Functions or other trusted backend. `paymentService.js` is not connected to an active flow.

## Navigation

- `AppNavigator` observes Firebase Auth state and loads the Firestore user profile. Logged-out users see `AuthStack`; signed-in, verified clients and providers see `MainTabStack`; profiles with role `admin` see `AdminDashboard`.
- Client tabs: Home (service search and requests), Bookings (requests, bids, bookings, chat, tracking placeholder, reviews), Profile, and Support.
- Provider tabs: Dashboard (job board, assignments, verification, chat), Profile, and Support.
- Provider/client/admin routing is based on client-readable profile data. Enforce authorization independently in Firebase Rules or a trusted backend.

## Repository Structure

```text
src/
  api/          Firebase initialization and auth, booking, profile, image services
  components/   Shared booking, profile, and common UI components
  constants/    Colors and dimensions
   hooks/        Auth state
  navigation/   Auth, tab, and feature stack navigators
  screens/      Auth, booking, provider, profile, review, chat, support, tracking, admin
```

## Local Setup

Prerequisites: Node.js compatible with Expo SDK 54, npm, and an Expo-supported iOS simulator, Android emulator, or physical device. Native development builds also require the relevant Xcode or Android toolchain.

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create a local environment file and fill it with the Firebase **client** configuration for the project:

   ```sh
   cp .env.example .env
   ```

3. Start Expo:

   ```sh
   npx expo start
   ```

Use `npx expo start --android`, `npx expo start --ios`, or `npx expo start --web` as appropriate. Native run scripts are also available: `npm run android` and `npm run ios`.

## Environment Variables

The Firebase JavaScript client reads these Expo variables at bundle time:

| Variable                                   | Purpose                               |
| ------------------------------------------ | ------------------------------------- |
| `EXPO_PUBLIC_FIREBASE_API_KEY`             | Firebase client configuration         |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`         | Firebase Authentication domain        |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID`          | Firebase project identifier           |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`      | Firebase Storage bucket configuration |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase project sender identifier    |
| `EXPO_PUBLIC_FIREBASE_APP_ID`              | Firebase client app identifier        |
| `EXPO_PUBLIC_FIREBASE_DATABASE_URL`        | Firebase Realtime Database URL        |

`EXPO_PUBLIC_*` values are embedded in the client bundle and are **not secrets**. Firebase client configuration is different from a service-account credential, but it still requires Firebase API restrictions and correctly configured Firebase Rules. Never put service-account keys, private keys, payment credentials, or other server secrets in an Expo public variable.

## Firebase Security Notes

- No Firestore or Realtime Database Rules files are included. Deployment safety therefore depends on rules configured in the Firebase project; the client code cannot establish those protections.
- Restrict profile reads and writes, service requests, bookings, chat messages, reviews, provider identity documents, and provider locations by authenticated UID, participant, and trusted role. Prevent users from assigning themselves the admin role or approving providers.
- Provider CNIC details and Base64 images are currently stored in Firestore user documents. Treat this as sensitive personal data and do not use real identity documents until access rules and retention practices are reviewed.
- Firebase client configuration and `google-services.json` contain public app configuration, not service-account credentials. They are not substitutes for security rules or API-key restrictions.
- A private EmailJS credential was present in reachable Git history and has been removed from the current source. Revoke/rotate it with EmailJS. Do not rewrite history in this cleanup pass; decide separately whether to coordinate history cleanup before publishing.

## Known Limitations and Improvements

- Add and test Firestore and Realtime Database Rules, ideally with the Firebase Emulator Suite. Move admin approval and other privileged operations behind trusted authorization.
- Store images in Firebase Storage with per-user/provider rules and persist download URLs rather than Base64 blobs in Firestore.
- Implement a trusted provider-location publisher, map/ETA experience, and real emergency dispatch before describing tracking as a live safety feature.
- Add participant authorization and consistent membership checks for chat, plus automated tests for request-to-booking and message access.
- Implement a payment provider through a trusted backend; do not treat UI prices or mock service code as payment support.
- Wire up or remove support actions, empty screens, and placeholder controls.
- Add automated tests and improve surfaced loading/error states across Firebase operations.

## Screenshots

No product screenshots are currently included. Add genuine captures at these paths when available; the placeholders below are intentionally not fabricated images.

| Screen                | Capture path                          |
| --------------------- | ------------------------------------- |
| Login                 | `screenshots/login.png`               |
| Home / service search | `screenshots/home-service-search.png` |
| Booking flow          | `screenshots/booking-flow.png`        |
| Provider dashboard    | `screenshots/provider-dashboard.png`  |
| Chat                  | `screenshots/chat.png`                |
| Admin dashboard       | `screenshots/admin-dashboard.png`     |

## Build and Deployment

The repository has Expo start and native run scripts, but no EAS build profile or deployment configuration. Configure Firebase environment variables in the chosen build environment, validate the Expo app configuration, and use an Expo development build for native integrations. The current tracking screen does not require a map SDK because its map UI is removed. Do not publish a production build until Firebase Rules, API restrictions, identity-data handling, and admin authorization have been reviewed.

## Checks

```sh
npm run lint
npx expo config --type public
git diff --check
```

There is no test script in `package.json`.
