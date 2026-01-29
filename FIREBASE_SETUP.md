# Firebase Setup Guide for SHADOWDEF

This guide will help you set up Firebase Authentication and Firestore for the SHADOWDEF game.

## 🔥 Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select an existing project
3. Enter your project name (e.g., "shadowdef-game")
4. Follow the setup wizard (Google Analytics is optional)

## 🔐 Step 2: Enable Authentication

1. In your Firebase project, go to **Authentication** → **Sign-in method**
2. Enable the following sign-in providers:
   - **Email/Password** - Click "Enable" and save
   - **Google** - Click "Enable", enter your project support email, and save
   - **Facebook** - Click "Enable", you'll need your Facebook App ID and App Secret

### Google Sign-in Setup:
- Use your existing Google Cloud OAuth credentials or create new ones
- Add authorized domains if needed

### Facebook Sign-in Setup:
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use existing one
3. Add "Facebook Login" product
4. Copy your **App ID** and **App Secret**
5. Add your domain to "Valid OAuth Redirect URIs"
6. Paste App ID and App Secret in Firebase Authentication settings

## 💾 Step 3: Set Up Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development) or **"Start in production mode"** (for production)
4. Select your preferred location (choose closest to your users)

### Security Rules (Important!)

Update your Firestore security rules to protect user data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // User data subcollections
      match /data/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

To update rules:
1. Go to **Firestore Database** → **Rules** tab
2. Paste the rules above
3. Click **"Publish"**

## ⚙️ Step 4: Get Your Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **"Your apps"** section
3. Click the **Web** icon (`</>`) to add a web app
4. Register your app with a nickname (e.g., "Shadowdef Web")
5. Copy the `firebaseConfig` object

It should look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## 📝 Step 5: Update Your Configuration

Open `css/js/data/config.js` and update the Firebase configuration:

```javascript
AUTH: {
    // Replace these with your actual Firebase config values
    FIREBASE_API_KEY: 'AIza...',  // from firebaseConfig.apiKey
    FIREBASE_AUTH_DOMAIN: 'your-project.firebaseapp.com',  // from firebaseConfig.authDomain
    FIREBASE_PROJECT_ID: 'your-project-id',  // from firebaseConfig.projectId
    FIREBASE_STORAGE_BUCKET: 'your-project.appspot.com',  // from firebaseConfig.storageBucket
    FIREBASE_MESSAGING_SENDER_ID: '123456789',  // from firebaseConfig.messagingSenderId
    FIREBASE_APP_ID: '1:123456789:web:abcdef',  // from firebaseConfig.appId
    
    USE_FIREBASE: true,  // Set to false to use localStorage fallback
    
    // ... other settings
}
```

## 🎮 Step 6: Test the Integration

1. Open your game in a browser
2. Open the browser console (F12)
3. Try to register a new account with email/password
4. Check the Firebase Console → Authentication to see if the user was created
5. Check Firestore Database to see if user data was saved

## 🚨 Troubleshooting

### "Firebase SDK not loaded" error
- Make sure the Firebase scripts are included in `index.html`
- Check browser console for script loading errors
- Ensure scripts load before your game code

### "Firebase Auth not initialized" error
- Verify your Firebase configuration in `config.js` is correct
- Check that all required Firebase services are enabled
- Check browser console for detailed error messages

### Authentication doesn't work
- Verify Email/Password provider is enabled in Firebase Console
- For Google/Facebook, ensure providers are properly configured
- Check browser console for specific error messages

### Firestore writes fail
- Check Firestore security rules (Step 3)
- Verify Firestore is enabled in Firebase Console
- Check browser console for permission errors

## 📊 Firestore Data Structure

The game creates the following structure in Firestore:

```
users/
  {userId}/
    - name: string
    - email: string
    - avatar: string
    - createdAt: timestamp
    - updatedAt: timestamp
    data/
      stats/
        - totalScore: number
        - highScore: number
        - missionsCompleted: number
        - level: number
        - experience: number
        - credits: number
        - achievements: array
        - lastPlayed: timestamp
      preferences/
        - musicEnabled: boolean
        - sfxEnabled: boolean
        - musicVolume: number
        - sfxVolume: number
        - difficulty: string
        - theme: string
```

## 🔒 Security Best Practices

1. **Never commit Firebase config with real credentials to public repositories**
   - Use environment variables in production
   - Consider using Firebase App Check for additional security

2. **Set up proper Firestore security rules** (see Step 3)

3. **Enable Firebase App Check** (optional, recommended for production)
   - Go to Firebase Console → App Check
   - Register your app domain
   - This helps prevent abuse

4. **Monitor usage in Firebase Console**
   - Check Authentication → Users
   - Monitor Firestore usage
   - Set up billing alerts

## 🔄 Fallback Mode

If Firebase is not configured or fails to initialize, the game will automatically fall back to localStorage mode. This means:
- User data is stored locally in the browser
- No cloud sync
- Data is lost if browser data is cleared
- No cross-device access

To disable Firebase and use localStorage only, set `USE_FIREBASE: false` in `config.js`.

## 📚 Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

---

**Note:** The Firebase integration is backward compatible. If Firebase is not configured, the game will automatically use localStorage as a fallback.

