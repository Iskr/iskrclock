# 🔥 Firebase Setup Guide for IskrClock

This guide will help you set up Firebase Authentication and Firestore for IskrClock to enable cross-device playlist synchronization.

## 📋 Prerequisites

- A Google account
- Basic knowledge of Firebase console

## 🚀 Step-by-Step Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add Project** or **Create a Project**
3. Enter project name (e.g., "iskrclock")
4. Disable Google Analytics (optional, not needed for this app)
5. Click **Create Project**

### 2. Enable Authentication

1. In your Firebase project, click **Authentication** in the left sidebar
2. Click **Get Started**
3. Enable the following sign-in methods:
   - **Email/Password**: Click on it → Toggle "Enable" → Save
   - **Google** (optional): Click on it → Toggle "Enable" → Enter project support email → Save

### 3. Create Firestore Database

1. Click **Firestore Database** in the left sidebar
2. Click **Create Database**
3. Choose **Start in production mode** (we'll add security rules later)
4. Select a location closest to your users
5. Click **Enable**

### 4. Set Up Security Rules

1. In Firestore Database, go to the **Rules** tab
2. Copy the contents from `firestore.rules` file in this repository
3. Paste it into the rules editor
4. Click **Publish**

These rules ensure:
- Users can only read/write their own data
- Data validation for required fields
- No unauthorized access

### 5. Get Firebase Configuration

1. Click the **⚙️ Settings** icon (gear icon) next to **Project Overview**
2. Click **Project Settings**
3. Scroll down to **Your apps** section
4. Click the **</>** (Web) icon to add a web app
5. Enter app nickname (e.g., "IskrClock Web")
6. Don't check "Set up Firebase Hosting"
7. Click **Register app**
8. Copy the `firebaseConfig` object

### 6. Configure IskrClock

1. In your IskrClock project folder, copy `firebase-config.example.js` to `firebase-config.js`:
   ```bash
   cp firebase-config.example.js firebase-config.js
   ```

2. Open `firebase-config.js` and replace the placeholder values with your Firebase config:

   ```javascript
   const firebaseConfig = {
       apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
       authDomain: "your-project-id.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project-id.appspot.com",
       messagingSenderId: "123456789012",
       appId: "1:123456789012:web:abcdef123456"
   };
   ```

3. Save the file

**⚠️ IMPORTANT**: The `firebase-config.js` file is in `.gitignore` and will not be committed to your repository to protect your API keys.

### 7. Test the Setup

1. Open `index.html` in your browser
2. Open browser console (F12)
3. You should see:
   ```
   ✅ Firebase initialized
   ✅ Auth & Sync ready
   ```
4. Click the **🔐 Вход** (Login) button in the header
5. Try registering a new account or signing in with Google

## 🔒 Security Features

### What's Protected:

- **User Data Isolation**: Each user can only access their own playlists
- **Authentication Required**: All sync operations require a logged-in user
- **Data Validation**: Firestore rules validate data structure
- **XSS Protection**: All user inputs are sanitized
- **HTTPS Only**: Firebase enforces HTTPS connections

### What's Stored:

- `customStations`: Array of user's custom radio stations/playlists
- `selectedStation`: Currently selected station ID
- `language`: User's language preference (ru/en)
- `lastModified`: Timestamp of last sync

**Note**: Audio files stored in IndexedDB are NOT synced to Firebase (they remain local only).

## 📱 Cross-Device Sync

Once configured, playlists will automatically sync:

1. **On Login**: Latest data is loaded from cloud
2. **On Save**: Changes are immediately synced to cloud
3. **Real-time Updates**: Changes from other devices appear instantly
4. **Conflict Resolution**: Cloud data takes precedence if newer

## 🔧 Troubleshooting

### "Firebase not configured" message

- Make sure `firebase-config.js` exists and has correct values
- Check browser console for errors
- Verify the file path is correct

### Authentication not working

- Check that Email/Password is enabled in Firebase Console → Authentication
- For Google Sign-In, make sure Google provider is enabled
- Check browser console for specific error messages

### Sync not working

- Ensure you're logged in (check for sync indicator in header)
- Verify Firestore rules are published correctly
- Check browser console for Firestore errors
- Make sure Firestore database is created

### Common Errors:

- `Firebase: Error (auth/api-key-not-valid)`: Wrong API key in config
- `Missing or insufficient permissions`: Firestore rules not set up correctly
- `CORS errors`: Check that your domain is authorized in Firebase Console

## 🌐 Deploying to GitHub Pages

If you're hosting on GitHub Pages:

1. Create `firebase-config.js` locally (don't commit it!)
2. For public deployment, you have two options:

   **Option A: GitHub Secrets** (recommended)
   - Store Firebase config in GitHub Secrets
   - Use GitHub Actions to inject config during build

   **Option B: Environment Variables**
   - Use a build step to generate `firebase-config.js` from env vars

3. Note: API keys can be public (they're restricted by domain in Firebase Console)
   - Go to Firebase Console → Project Settings → General
   - Under "Your apps", click on your web app
   - Add your GitHub Pages domain to authorized domains

## 🔄 Migration from localStorage

Existing users will automatically migrate their data on first login:

1. User logs in for the first time
2. System checks localStorage for existing playlists
3. If found and newer than cloud data, uploads to Firestore
4. Future changes sync bidirectionally

## 📞 Support

For issues or questions:
- Check browser console for error messages
- Review [Firebase Documentation](https://firebase.google.com/docs)
- Open an issue on GitHub

## 🎉 Done!

Your IskrClock app is now configured with secure authentication and cross-device sync!

Users can:
- ✅ Create accounts with email/password or Google
- ✅ Access playlists from any device
- ✅ Have data synced in real-time
- ✅ Enjoy secure, private storage of their preferences
