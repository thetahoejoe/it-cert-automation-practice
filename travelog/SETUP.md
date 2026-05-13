# Travelog — Setup Guide

## Prerequisites

- Node.js 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm install -g expo-cli`
- [EAS CLI](https://docs.expo.dev/eas/) (for iOS builds): `npm install -g eas-cli`
- A [Supabase](https://supabase.com) account (free tier works)
- A [Mapbox](https://mapbox.com) account (free tier: 50,000 map loads/month)

---

## 1. Supabase Setup

1. Create a new project at https://supabase.com
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Go to **Storage → Buckets** and create a bucket named `event-photos`
   - Set it to **private**
   - Add storage policies:
     - `SELECT`: `auth.uid()::text = (storage.fspath(name))[1]`
     - `INSERT`: `auth.uid()::text = (storage.fspath(name))[1]`
     - `DELETE`: `auth.uid()::text = (storage.fspath(name))[1]`
4. Go to **Settings → API** and copy:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public key** → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

---

## 2. Mapbox Setup

1. Create an account at https://mapbox.com
2. Go to **Account → Tokens**
3. Create a token with the default public scopes
4. Copy it → `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`

---

## 3. Environment Variables

Create a `.env` file in the `travelog/` directory:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1...
```

---

## 4. Running the App

```bash
cd travelog
npm install

# Web
npm run web

# iOS Simulator (requires macOS + Xcode)
npm run ios
```

### Running on a Real iPhone/iPad

Because `react-native-maps` is a native module, you need **EAS Build** to run on a real device:

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in
eas login

# Configure your project
eas build:configure

# Build a development client for iOS
eas build --profile development --platform ios

# Then start the dev server
npx expo start --dev-client
```

---

## 5. App Features

| Feature | Description |
|---------|-------------|
| **Auth** | Email/password sign-up and sign-in via Supabase Auth |
| **Journey Grid** | Searchable, sortable 2-column card grid of all entries |
| **World Map** | Interactive map showing all entries as pins; tap to preview |
| **New Entry** | Prompts for title, date (defaults to today), auto-fills GPS location, supports multiple photos from Camera or Photo Library |
| **Location Search** | Type to search any place via Mapbox Geocoding; tap GPS button to use device location |
| **Photo Carousel** | Swipeable full-width photo carousel on the detail screen |
| **Edit / Delete** | Edit any field or delete an entry from the detail screen |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo (React Native) + Expo Router |
| Backend | Supabase (Postgres + Auth + Storage) |
| Maps (iOS/Android) | react-native-maps (Apple Maps) |
| Maps (Web) | react-map-gl + Mapbox GL JS |
| Location | expo-location |
| Photos | expo-image-picker |
| Geocoding | Mapbox Geocoding API |
| Language | TypeScript |
