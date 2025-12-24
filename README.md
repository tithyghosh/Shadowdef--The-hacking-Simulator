# 🎮 SHADOWDEF

**A cybersecurity learning game disguised as an elite hacking simulator.**

Players become junior cyber-operatives solving realistic puzzles while guided by an AI mentor in a living cyberpunk world.

---

## 📋 **Quick Start**

### **Development Setup**

1. **Clone/Download** the project files
2. **Open `index.html`** in a modern browser (Chrome, Firefox, Edge)
3. **Start playing!** No build step required for basic development

### **Recommended Setup (Optional)**

For a better development experience:

```bash
# Using a local server (Python)
python -m http.server 8000

# Or using Node.js
npx http-server -p 8000

# Then open: http://localhost:8000
```

---

## 📁 **Project Structure**

```
shadowdef/
│
├── index.html              # Main entry point - START HERE
│
├── css/                    # All stylesheets
│   ├── main.css           # Core layout & variables
│   ├── ui-components.css  # Buttons, modals, inputs
│   ├── screens.css        # Screen-specific layouts
│   ├── puzzles.css        # Puzzle styles
│   └── animations.css     # Keyframe animations
│
├── js/                    # JavaScript modules
│   ├── main.js           # App initialization
│   │
│   ├── core/             # Game engine
│   │   ├── Game.js       # Main controller
│   │   ├── StateManager.js
│   │   ├── ScoreManager.js
│   │   └── AudioManager.js
│   │
│   ├── screens/          # Screen management
│   │   ├── ScreenManager.js
│   │   ├── MainMenu.js
│   │   ├── MissionSelect.js
│   │   ├── GameScreen.js
│   │   └── ResultsScreen.js
│   │
│   ├── puzzles/          # Puzzle logic
│   │   ├── PuzzleBase.js
│   │   ├── PasswordCrack.js
│   │   ├── FirewallBypass.js
│   │   ├── NetworkNav.js
│   │   ├── MalwareDetect.js
│   │   └── PhishingID.js
│   │
│   ├── systems/          # Game systems
│   │   ├── AIOpponent.js
│   │   ├── HintSystem.js
│   │   ├── Timer.js
│   │   └── Progression.js
│   │
│   ├── ui/               # UI components
│   │   ├── UIManager.js
│   │   ├── Modal.js
│   │   ├── Notification.js
│   │   └── Background.js
│   │
│   ├── data/             # Game data
│   │   ├── missions.js   # Mission definitions
│   │   ├── dialogue.js   # AI mentor text
│   │   ├── hints.js      # Hint database
│   │   └── config.js     # Game configuration
│   │
│   └── utils/            # Utilities
│       ├── helpers.js    # Helper functions
│       ├── constants.js  # Game constants
│       └── storage.js    # localStorage wrapper
│
├── assets/               # Media files (to be added)
│   ├── audio/
│   ├── images/
│   └── fonts/
│
└── README.md            # This file
```

---

## 🚀 **Current Status**

### **✅ Implemented (Base Structure)**

- ✅ Project file structure
- ✅ HTML skeleton with all screens
- ✅ Complete CSS styling system
- ✅ Animated cyberpunk background
- ✅ Core game controller
- ✅ Mission data system
- ✅ Configuration system
- ✅ Module architecture

### **🔨 In Progress (To Implement)**

- ⏳ StateManager.js (save/load system)
- ⏳ ScoreManager.js (scoring logic)
- ⏳ ScreenManager.js (screen transitions)
- ⏳ MissionSelect.js (mission rendering)
- ⏳ GameScreen.js (gameplay controller)
- ⏳ PasswordCrack.js (first puzzle)
- ⏳ AIOpponent.js (competitor logic)
- ⏳ Background.js (canvas animation)
- ⏳ UIManager.js (modals & notifications)

### **📋 To Do (Phase 1)**

- [ ] Complete all core modules
- [ ] Implement password puzzle fully
- [ ] Add basic sound effects
- [ ] Create 3 missions
- [ ] Test save/load system

---

## 🎯 **Development Roadmap**

### **Phase 1: Core Prototype** (2-3 weeks)
- Complete basic game loop
- Implement password cracking puzzle
- Add timer & scoring
- Create 3 starter missions
- Basic save system

### **Phase 2: Content & Polish** (3-4 weeks)
- Add all 5 puzzle types
- Create 10 missions
- Implement AI opponent
- Add sound effects
- Polish UI animations

### **Phase 3: Full Features** (3-4 weeks)
- Career path system
- Customization options
- Achievement system
- Settings & accessibility
- 20 more missions

### **Phase 4: Final Polish** (2 weeks)
- Bug fixing
- Performance optimization
- Tutorial refinement
- Playtesting
- Release preparation

---

## 🔧 **How to Add New Features**

### **Adding a New Mission**

Edit `js/data/missions.js`:

```javascript
{
    id: 9,
    title: "YOUR MISSION NAME",
    desc: "Description here",
    difficulty: "medium",
    type: "password", // or firewall, network, etc.
    objectives: [
        "Objective 1",
        "Objective 2"
    ],
    puzzle: {
        // Puzzle-specific data
    },
    aiSpeed: 1.0,
    rewards: { xp: 200, credits: 100 },
    completed: false,
    locked: true
}
```

### **Adding a New Puzzle Type**

1. Create `js/puzzles/YourPuzzle.js`
2. Extend `PuzzleBase` class
3. Implement required methods:
   - `init()` - Setup puzzle
   - `render()` - Draw puzzle UI
   - `check()` - Validate solution
   - `showHint()` - Display hint

### **Modifying Styles**

- **Colors**: Edit CSS variables in `css/main.css`
- **Layouts**: Modify `css/screens.css`
- **Components**: Update `css/ui-components.css`
- **Animations**: Add to `css/animations.css`

### **Changing Game Settings**

Edit `js/data/config.js`:

```javascript
SCORING: {
    BASE_SCORE: 1000, // Change this
    // ... other settings
}
```

---

## 🎨 **Customization**

### **Color Scheme**

Edit CSS variables in `css/main.css`:

```css
:root {
    --cyber-blue: #00f3ff;    /* Primary accent */
    --cyber-pink: #ff006e;    /* Secondary accent */
    --cyber-purple: #8b5cf6;  /* Tertiary accent */
    --cyber-green: #00ff41;   /* Success color */
    /* ... modify as needed */
}
```

### **Fonts**

Currently uses system monospace fonts. To add custom fonts:

1. Add font files to `assets/fonts/`
2. Import in `css/main.css`:

```css
@font-face {
    font-family: 'CyberFont';
    src: url('../assets/fonts/your-font.woff2');
}

:root {
    --font-mono: 'CyberFont', monospace;
}
```

---

## 🐛 **Debugging**

### **Enable Debug Mode**

In `js/data/config.js`:

```javascript
DEBUG: {
    ENABLED: true,
    LOG_LEVEL: 'debug',
    SHOW_FPS: true,
    UNLOCK_ALL_MISSIONS: true, // Unlock everything
    INFINITE_HINTS: true
}
```

### **Browser Console**

Access game instance in console:
```javascript
// Check current mission
window.game.currentMission

// Force complete mission
window.game.completeMission(true, {})

// Reset progress
window.game.state.resetProgress()
```

---

## 📊 **Performance**

### **Target Specifications**

- **Frame Rate**: 60 FPS on integrated graphics
- **Load Time**: < 5 seconds initial load
- **Memory**: < 200MB RAM usage
- **Browser**: Chrome 90+, Firefox 85+, Edge 90+

### **Optimization Tips**

- Reduce `PARTICLE_COUNT` in config for low-end devices
- Disable animations with `ENABLE_ANIMATIONS: false`
- Use `REDUCE_QUALITY_ON_LOW_FPS: true`

---

## 🧪 **Testing**

### **Manual Testing Checklist**

- [ ] Main menu loads correctly
- [ ] Mission selection shows locked/unlocked states
- [ ] First mission starts and plays
- [ ] Password input works
- [ ] Hints display correctly
- [ ] Timer counts down
- [ ] AI opponent progresses
- [ ] Win/lose conditions trigger
- [ ] Results screen shows stats
- [ ] Progress saves and loads
- [ ] Settings can be changed
- [ ] Game works on mobile (responsive)

---

## 📝 **Adding Content**

### **Assets Needed**

1. **Audio**
   - Background music (3 tracks, ~10min each)
   - Button click sound
   - Success/failure sounds
   - Hint notification sound
   - Timer warning sound

2. **Images**
   - Logo (SVG or PNG)
   - AI mentor avatars (3-5 variations)
   - AI opponent avatars (3-5 variations)
   - Mission icons (optional)

3. **Fonts**
   - Monospace cyberpunk font
   - Header display font (optional)

---

## 🤝 **Contributing**

### **Code Style**

- Use ES6+ JavaScript
- Follow modular architecture
- Comment complex logic
- Use meaningful variable names
- Keep functions small and focused

### **Git Workflow**

```bash
# Create feature branch
git checkout -b feature/puzzle-firewall

# Make changes and commit
git add .
git commit -m "Add firewall bypass puzzle"

# Push and create PR
git push origin feature/puzzle-firewall
```

---

## 📄 **License**

[Your License Here - MIT, GPL, etc.]

---

## 🙏 **Credits**

- **Game Design**: [Your Name]
- **Development**: [Your Team]
- **Assets**: [Asset Creators]

---

## 📞 **Contact**

- **Issues**: Use GitHub Issues
- **Email**: [your-email@example.com]
- **Discord**: [Your Discord Server]

---

## 🎯 **Next Steps**

1. **Read the docs** - Understand the architecture
2. **Run the game** - Test what's implemented
3. **Pick a task** - Choose from the roadmap
4. **Build & test** - Implement and verify
5. **Commit changes** - Save your progress

**Let's build something amazing! 🚀**