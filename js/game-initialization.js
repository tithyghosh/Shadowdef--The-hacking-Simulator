// Load complex game systems after loading screen works
setTimeout(async () => {
    try {
        console.log('🔧 Loading game systems...');
        
        // Import and initialize game systems
        const { Game } = await import('./css/js/core/Game.js');
        const { AuthManager } = await import('./css/js/core/AuthManager.js');
        const { Background } = await import('./css/js/ui/Background.js');
        const { UIManager } = await import('./css/js/ui/UIManager.js');
        const { AudioManager } = await import('./css/js/core/AudioManager.js');
        const { LoginScreen } = await import('./css/js/screens/LoginScreen.js');
        const { ProfileScreen } = await import('./css/js/screens/ProfileScreen.js');
        
        console.log('📦 All modules imported successfully');
        
        // Initialize background
        const background = new Background('bg-canvas');
        background.start();
        
        // Initialize managers
        const authManager = AuthManager.getInstance();
        const audio = AudioManager.getInstance();
        const ui = new UIManager();
        
        // Initialize game
        const game = new Game(ui, audio);
        const loginScreen = new LoginScreen(game);
        const profileScreen = new ProfileScreen(game);
        
        console.log('🎮 Game instance created:', game);
        
        // Make globally available
        window.game = game;
        window.authManager = authManager;
        window.loginScreen = loginScreen;
        window.profileScreen = profileScreen;
        
        // Remove loading state from Mission button
        const missionBtn = document.querySelector('[data-action="mission-select"]');
        if (missionBtn) {
            missionBtn.disabled = false;
            missionBtn.style.opacity = '1';
            const cardTitle = missionBtn.querySelector('.card-title');
            if (cardTitle && cardTitle.textContent.includes('LOADING')) {
                cardTitle.textContent = 'MISSIONS';
            }
            console.log('✅ Mission button enabled - game systems ready');
        }
        
        // Password Training System Integration
        window.startPasswordTraining = function(level = 1) {
            console.log('🔐 Starting Password Training System at level', level);
            
            // Show password training directly
            showPasswordTraining();
            
            // If specific level requested, start that level
            if (level > 1 && passwordGameState.unlockedLevels.includes(level)) {
                setTimeout(() => startPasswordLevel(level), 100);
            }
            
            return true;
        };
        
        // Setup event listeners
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            
            const action = btn.dataset.action;
            console.log('🖱️ Button clicked with action:', action);
            handleAction(action, e);
        });
        
        function handleAction(action, event) {
            console.log('🎯 Handling action:', action);
            
            try {
                switch (action) {
                    case 'mission-select':
                        console.log('📋 Opening mission categories...');
                        if (game && typeof game.showMissionCategories === 'function') {
                            game.showMissionCategories();
                        } else {
                            console.error('❌ Game.showMissionCategories not available');
                            // Fallback: show screen directly
                            showScreen('mission-select');
                        }
                        break;
                    case 'back-to-categories':
                        console.log('🔙 Going back to categories...');
                        if (game && typeof game.showMissionCategories === 'function') {
                            game.showMissionCategories();
                        } else {
                            showScreen('mission-select');
                        }
                        break;
                    case 'back':
                        console.log('🔙 Going back...');
                        showScreen('main-menu');
                        break;
                    case 'back-to-levels':
                        if (game && typeof game.backToCurrentCategoryLevels === 'function') {
                            game.backToCurrentCategoryLevels();
                        } else {
                            showScreen('mission-select');
                        }
                        break;
                    case 'next-level':
                        if (game && typeof game.goToNextLevel === 'function') {
                            game.goToNextLevel();
                        }
                        break;
                    case 'pause':
                        if (game && typeof game.pauseGame === 'function') {
                            game.pauseGame();
                        }
                        break;
                    case 'profile':
                        console.log('👤 Opening profile...');
                        showScreen('profile-screen');
                        if (profileScreen && typeof profileScreen.render === 'function') {
                            profileScreen.render();
                        }
                        break;
                    case 'credits-store':
                        showCreditsStore();
                        break;
                    case 'settings':
                        if (game && typeof game.showSettings === 'function') {
                            game.showSettings();
                        }
                        break;
                    case 'credits':
                        if (game && typeof game.showCredits === 'function') {
                            game.showCredits();
                        }
                        break;
                    case 'login':
                        if (authManager.isUserAuthenticated()) {
                            ui.showConfirm(
                                'Logout Confirmation',
                                'Are you sure you want to logout?',
                                async () => await authManager.logout()
                            );
                        } else {
                            showScreen('login-screen');
                            if (loginScreen && typeof loginScreen.render === 'function') {
                                loginScreen.render();
                            }
                        }
                        break;
                    default:
                        console.warn('Unknown action:', action);
                }
            } catch (error) {
                console.error('❌ Error handling action:', action, error);
                // Fallback navigation
                if (action === 'mission-select' || action === 'back-to-categories') {
                    showScreen('mission-select');
                } else if (action === 'back') {
                    showScreen('main-menu');
                }
            }
        }
        
        // Simple screen switching function as fallback
        function showScreen(screenId) {
            console.log('📺 Switching to screen:', screenId);
            
            // Hide all screens
            const screens = document.querySelectorAll('.screen');
            screens.forEach(screen => {
                screen.classList.remove('active');
                screen.style.display = 'none';
                screen.style.opacity = '0';
            });
            
            // Show target screen
            const targetScreen = document.getElementById(screenId);
            if (targetScreen) {
                targetScreen.classList.add('active');
                targetScreen.style.display = 'block';
                targetScreen.style.opacity = '1';
                console.log('✅ Screen switched to:', screenId);
                
                // Update body class for screen-specific styling
                document.body.className = `screen-${screenId}`;
            } else {
                console.error('❌ Screen not found:', screenId);
            }
        }
        
        // Handle category selection
        document.addEventListener('click', (e) => {
            const categoryCard = e.target.closest('[data-category]');
            if (categoryCard) {
                const category = categoryCard.dataset.category;
                console.log('🎯 Category selected:', category);
                
                if (category === 'password') {
                    // Show password cracking game
                    console.log('🎮 Starting Password Cracking Game...');
                    if (typeof window.showPasswordCrackingGame === 'function') {
                        window.showPasswordCrackingGame();
                    } else if (typeof window.showSecurityTraining === 'function') {
                        window.showSecurityTraining();
                    } else {
                        console.error('❌ Password game functions not available');
                        showScreen('password-missions');
                    }
                } else if (category === 'malware') {
                    showScreen('malware-missions');
                } else if (category === 'network') {
                    showScreen('network-missions');
                } else if (game && typeof game.showCategoryMissions === 'function') {
                    game.showCategoryMissions(category);
                } else {
                    console.warn('Category not implemented:', category);
                }
            }
        });
        
        function showCreditsStore() {
            const user = authManager.getCurrentUser();
            const credits = user?.gameStats?.credits || 0;
            
            ui.showModal('Gaming Credits', `
                <div class="credits-store">
                    <div class="current-credits">
                        <div class="credits-display-large">
                            <span class="credits-icon">💰</span>
                            <span class="credits-amount">${credits}</span>
                            <span class="credits-label">Credits</span>
                        </div>
                    </div>
                    <div class="credits-info">
                        <h3>How to Earn Credits:</h3>
                        <div class="earning-methods">
                            <div class="earning-method">
                                <span class="method-icon">🎯</span>
                                <span class="method-text">Complete missions</span>
                                <span class="method-reward">+100-500</span>
                            </div>
                            <div class="earning-method">
                                <span class="method-icon">🏆</span>
                                <span class="method-text">Unlock achievements</span>
                                <span class="method-reward">+200-1000</span>
                            </div>
                        </div>
                    </div>
                </div>
            `, {
                buttons: [{
                    text: 'START EARNING',
                    class: 'btn-primary',
                    onClick: () => {
                        if (game && typeof game.showMissionSelect === 'function') {
                            game.showMissionSelect();
                        } else {
                            showScreen('mission-select');
                        }
                    }
                }]
            });
        }
        
        console.log('✅ Game systems loaded successfully');
        
        // Don't transition to main menu here - let the loading system handle it
        // The loading system will show the main menu when loading completes
        
    } catch (error) {
        console.error('❌ Failed to load game systems:', error);
        console.log('🎮 Falling back to basic navigation mode');
        
        // Fallback navigation without complex game systems
        setupBasicNavigation();
    }
}, 2000);

// Basic navigation fallback when complex game systems fail to load
function setupBasicNavigation() {
    console.log('🔧 Setting up basic navigation fallback...');
    
    // Simple screen switching function
    function showScreen(screenId) {
        console.log('📺 Switching to screen:', screenId);
        
        // Hide all screens
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.remove('active');
            screen.style.display = 'none';
            screen.style.opacity = '0';
        });
        
        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            targetScreen.style.display = 'block';
            targetScreen.style.opacity = '1';
            console.log('✅ Screen switched to:', screenId);
        } else {
            console.error('❌ Screen not found:', screenId);
        }
    }
    
    // Setup basic event listeners
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (btn) {
            const action = btn.dataset.action;
            console.log('🖱️ Basic navigation - Button clicked:', action);
            
            switch (action) {
                case 'mission-select':
                    showScreen('mission-select');
                    break;
                case 'back-to-categories':
                    showScreen('mission-select');
                    break;
                case 'back':
                    showScreen('main-menu');
                    break;
                case 'profile':
                    showScreen('profile-screen');
                    break;
                case 'login':
                    showScreen('login-screen');
                    break;
                default:
                    console.log('Basic navigation - Action not handled:', action);
            }
        }
        
        // Handle category selection
        const categoryCard = e.target.closest('[data-category]');
        if (categoryCard) {
            const category = categoryCard.dataset.category;
            console.log('🎯 Basic navigation - Category selected:', category);
            
            if (category === 'password') {
                console.log('🎮 Basic navigation - Starting Password Cracking Game...');
                showScreen('password-missions');
                // Try to initialize the game after showing the screen
                setTimeout(() => {
                    if (typeof window.showPasswordCrackingGame === 'function') {
                        window.showPasswordCrackingGame();
                    } else if (typeof window.testGameShow === 'function') {
                        window.testGameShow();
                    }
                }, 100);
            } else if (category === 'malware') {
                showScreen('malware-missions');
            } else if (category === 'network') {
                showScreen('network-missions');
            }
        }
    });
    
    // Enable mission button
    const missionBtn = document.querySelector('[data-action="mission-select"]');
    if (missionBtn) {
        missionBtn.disabled = false;
        missionBtn.style.opacity = '1';
        const cardTitle = missionBtn.querySelector('.card-title');
        if (cardTitle && cardTitle.textContent.includes('LOADING')) {
            cardTitle.textContent = 'MISSIONS';
        }
        console.log('✅ Basic navigation - Mission button enabled');
    }
    
    console.log('✅ Basic navigation setup complete');
    
    // Don't transition to main menu here - let the loading system handle it
    // The loading system will show the main menu when loading completes
}