# SHADOWDEF Authentication System

## 🔐 Overview

The SHADOWDEF authentication system provides comprehensive user management with social login options, cloud-based progress saving, and automatic score synchronization. Users can log in with Google, Facebook, or email/password, and their gaming progress is automatically saved and synced across devices.

## ✨ Features

### **Authentication Methods**
- 🔍 **Google OAuth** - Sign in with Google account
- 📘 **Facebook Login** - Sign in with Facebook account  
- 📧 **Email/Password** - Traditional email registration and login
- 👤 **Guest Mode** - Play without account (progress not saved)

### **User Profile System**
- 🎯 **Statistics Tracking** - Total score, high score, missions completed, play time
- 🏆 **Achievement System** - Unlock achievements and earn bonus credits
- 💰 **Gaming Credits** - Earn and spend credits in-game
- 📊 **Progress Tracking** - Level progression with XP system
- 🎨 **Profile Customization** - Avatar and display name editing

### **Cloud Synchronization**
- 💾 **Auto-Save** - Progress automatically saved to cloud
- 🔄 **Cross-Device Sync** - Access progress from any device
- ⚡ **Real-time Updates** - Stats update immediately after gameplay
- 🛡️ **Data Persistence** - Progress survives app uninstalls

## 🚀 Setup Instructions

### 1. **Configure Social Login Providers**

#### Google OAuth Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins
6. Update `css/js/data/config.js`:
```javascript
AUTH: {
    GOOGLE_CLIENT_ID: 'your-actual-google-client-id-here',
    // ... other settings
}
```

#### Facebook Login Setup:
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure valid OAuth redirect URIs
5. Update `css/js/data/config.js`:
```javascript
AUTH: {
    FACEBOOK_APP_ID: 'your-actual-facebook-app-id-here',
    // ... other settings
}
```

### 2. **Backend Integration (Optional)**

For production use, replace the mock authentication methods in `AuthManager.js`:

```javascript
// Replace mockEmailLogin with real API call
async mockEmailLogin(email, password) {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return response.json();
}
```

### 3. **Database Schema (Recommended)**

```sql
-- Users table
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    provider ENUM('google', 'facebook', 'email'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User game statistics
CREATE TABLE user_stats (
    user_id VARCHAR(255) PRIMARY KEY,
    total_score INT DEFAULT 0,
    high_score INT DEFAULT 0,
    missions_completed INT DEFAULT 0,
    total_play_time INT DEFAULT 0,
    level INT DEFAULT 1,
    experience INT DEFAULT 0,
    credits INT DEFAULT 1000,
    achievements JSON,
    last_played TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User preferences
CREATE TABLE user_preferences (
    user_id VARCHAR(255) PRIMARY KEY,
    music_enabled BOOLEAN DEFAULT TRUE,
    sfx_enabled BOOLEAN DEFAULT TRUE,
    music_volume DECIMAL(3,2) DEFAULT 0.30,
    sfx_volume DECIMAL(3,2) DEFAULT 0.50,
    difficulty VARCHAR(20) DEFAULT 'normal',
    theme VARCHAR(20) DEFAULT 'cyber',
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 🎮 Usage Examples

### **Check Authentication Status**
```javascript
const authManager = AuthManager.getInstance();
if (authManager.isUserAuthenticated()) {
    const user = authManager.getCurrentUser();
    console.log(`Welcome back, ${user.name}!`);
}
```

### **Update User Statistics**
```javascript
// Award points and credits after mission completion
window.updateUserStats({
    totalScore: currentScore + newScore,
    missionsCompleted: currentMissions + 1
});

// Award experience and credits
window.awardExperience(100, 'Mission completion');
window.awardCredits(50, 'Performance bonus');
```

### **Listen for Authentication Events**
```javascript
document.addEventListener('shadowdef:auth:login', (e) => {
    console.log('User logged in:', e.detail.name);
    // Load user preferences, update UI, etc.
});

document.addEventListener('shadowdef:auth:logout', () => {
    console.log('User logged out');
    // Clear user data, return to login screen
});
```

## 🏆 Achievement System

### **Built-in Achievements**
- 🎯 **First Steps** - Complete your first mission (+100 credits)
- ⚡ **Speed Demon** - Complete mission in under 2 minutes (+250 credits)
- 💎 **Perfectionist** - Complete mission without hints (+200 credits)
- 🏆 **High Scorer** - Achieve score over 10,000 (+500 credits)
- ⏰ **Dedicated Player** - Play for 5 hours total (+300 credits)
- 💰 **Credit Collector** - Earn 5,000 credits (+1000 credits)

### **Adding Custom Achievements**
```javascript
// In Game.js checkAchievements method
if (!achievements.includes('custom_achievement') && condition) {
    newAchievements.push('custom_achievement');
    window.awardCredits(amount, 'Custom Achievement');
}
```

## 💰 Credit System

### **Earning Credits**
- **Mission Completion** - Base credits based on score
- **Achievements** - Bonus credits for milestones
- **Level Up** - 100 credits per level gained
- **Daily Login** - 50 credits for logging in daily
- **Performance Bonuses** - Extra credits for speed/accuracy

### **Credit Usage** (Future Implementation)
- Unlock premium missions
- Purchase cosmetic upgrades
- Buy power-ups and hints
- Unlock exclusive content

## 🔧 Configuration Options

### **Authentication Settings**
```javascript
AUTH: {
    GOOGLE_CLIENT_ID: 'your-google-client-id',
    FACEBOOK_APP_ID: 'your-facebook-app-id',
    SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours
    AUTO_SYNC_INTERVAL: 5 * 60 * 1000, // 5 minutes
    ENABLE_GUEST_MODE: true,
    REQUIRE_EMAIL_VERIFICATION: false
}
```

### **Progression Settings**
```javascript
PROGRESSION: {
    XP_PER_LEVEL: 1000,
    STARTING_CREDITS: 1000,
    DAILY_LOGIN_BONUS: 50,
    ACHIEVEMENT_CREDITS: {
        BRONZE: 100,
        SILVER: 250,
        GOLD: 500,
        PLATINUM: 1000
    }
}
```

## 🧪 Testing

### **Test Authentication**
1. Open `auth-test.html` in your browser
2. Test different login methods
3. Verify user profile display
4. Check statistics tracking

### **Test Game Integration**
1. Start the main game (`index.html`)
2. Create an account or login
3. Complete a mission
4. Check profile for updated stats
5. Verify credits and XP were awarded

## 🚀 Deployment Checklist

- [ ] Configure Google OAuth credentials
- [ ] Configure Facebook app credentials
- [ ] Set up backend API endpoints
- [ ] Configure database tables
- [ ] Test social login functionality
- [ ] Test data synchronization
- [ ] Verify achievement system
- [ ] Test guest mode functionality
- [ ] Configure HTTPS for production
- [ ] Set up data backup system

## 🔒 Security Considerations

1. **Never store passwords in plain text**
2. **Use HTTPS in production**
3. **Validate all user inputs**
4. **Implement rate limiting**
5. **Use secure session management**
6. **Regularly update dependencies**
7. **Implement proper CORS policies**
8. **Use environment variables for secrets**

## 📱 Mobile Considerations

The authentication system is fully responsive and works on mobile devices:
- Touch-friendly login forms
- Responsive profile layouts
- Mobile-optimized social login buttons
- Proper viewport handling

## 🎯 Future Enhancements

- **Two-Factor Authentication** - Enhanced security
- **Social Features** - Friend lists, leaderboards
- **Cloud Save Conflicts** - Handle multiple device conflicts
- **Offline Mode** - Queue actions when offline
- **Advanced Analytics** - Detailed gameplay metrics
- **Push Notifications** - Re-engagement features

---

## 📞 Support

For issues or questions about the authentication system:
1. Check the browser console for error messages
2. Verify social login credentials are correct
3. Test with `auth-test.html` for debugging
4. Check network requests in browser dev tools

The authentication system provides a solid foundation for user management and can be extended with additional features as needed.