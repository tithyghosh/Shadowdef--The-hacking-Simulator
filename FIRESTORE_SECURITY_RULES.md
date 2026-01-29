# Firestore Security Rules Setup

## The Problem

You're seeing this error:
```
FirebaseError: Missing or insufficient permissions.
```

This happens because Firestore security rules are blocking access to your user data.

## Solution: Update Firestore Security Rules

### Step 1: Open Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **shadowdef-6a79f**

### Step 2: Navigate to Firestore Rules
1. Click on **Firestore Database** in the left sidebar
2. Click on the **Rules** tab at the top

### Step 3: Copy and Paste These Rules

Replace the existing rules with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the data
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection - users can only read/write their own data
    match /users/{userId} {
      // Users can read/write their own user document
      allow read, write: if isOwner(userId);
      
      // User data subcollections (stats and preferences)
      match /data/{document} {
        allow read, write: if isOwner(userId);
      }
    }
  }
}
```

### Step 4: Publish the Rules
1. Click the **"Publish"** button
2. Wait a few seconds for the rules to be deployed

## Rules Explanation

- **`isAuthenticated()`**: Checks if a user is logged in
- **`isOwner(userId)`**: Checks if the logged-in user's ID matches the document's userId
- Users can only access their own data in the `/users/{userId}` path
- This prevents users from reading or modifying other users' data

## Testing the Rules

After publishing:

1. Try logging in with Google again
2. Check the browser console - the permission errors should be gone
3. Check Firebase Console → Firestore Database to see if user data is being created

## Alternative: Development Mode (NOT FOR PRODUCTION)

⚠️ **WARNING: Only use this for development/testing!**

If you need to test quickly without setting up proper rules, you can use:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

This allows any authenticated user to read/write any document. **Never use this in production!**

## Verifying Rules Work

1. **Test with your account**: Login and check if data saves correctly
2. **Check Firestore Console**: Go to Firestore Database and verify data structure:
   ```
   users/
     {your-user-id}/
       - name: "Your Name"
       - email: "your@email.com"
       data/
         stats/
           - totalScore: 0
           - level: 1
           - credits: 1000
         preferences/
           - musicEnabled: true
           - difficulty: "normal"
   ```

## Troubleshooting

### Rules not working?
- Make sure you clicked "Publish" after editing
- Wait 30-60 seconds for rules to propagate
- Check the browser console for specific error messages
- Verify you're logged in (check `request.auth != null`)

### Still getting permission errors?
- Double-check the rules syntax (make sure there are no typos)
- Verify your user ID matches the document path
- Check if Firebase Auth is working correctly (try logging out and back in)

### Need more restrictive rules?
For production, you might want more granular control:
- Only allow specific fields to be updated
- Add validation for data types
- Implement rate limiting

---

**Important**: After setting up the rules, try logging in again. The permission errors should be resolved!

