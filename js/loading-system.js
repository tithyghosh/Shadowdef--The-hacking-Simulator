// Loading system variables
let loadingStarted = false;
let networkBackground = null;

function startSimpleLoading() {
    if (loadingStarted) return;
    loadingStarted = true;
    
    console.log('🚀 Starting loading with network background...');
    
    const progressFill = document.getElementById('loading-progress-fill');
    const progressPercentage = document.getElementById('loading-percentage');
    const progressLabel = document.querySelector('.progress-label');
    const loadingScreen = document.getElementById('loading-screen');
    const mainMenu = document.getElementById('main-menu');
    
    if (!progressFill || !progressPercentage || !progressLabel) {
        console.error('❌ Loading elements not found');
        return;
    }
    
    const steps = [
        { text: 'Initializing Core Systems...', progress: 15, duration: 800 },
        { text: 'Loading Game Assets...', progress: 35, duration: 1000 },
        { text: 'Preparing Audio Systems...', progress: 50, duration: 600 },
        { text: 'Loading Mission Data...', progress: 70, duration: 800 },
        { text: 'Initializing Security Protocols...', progress: 85, duration: 600 },
        { text: 'Finalizing Setup...', progress: 100, duration: 500 }
    ];
    
    let currentStep = 0;
    let currentProgress = 0;
    
    function animateToProgress(targetProgress, duration, callback) {
        const startProgress = currentProgress;
        const progressDiff = targetProgress - startProgress;
        const startTime = Date.now();
        
        function updateFrame() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            currentProgress = startProgress + (progressDiff * progress);
            
            progressFill.style.width = currentProgress + '%';
            progressPercentage.textContent = Math.floor(currentProgress) + '%';
            
            if (progress < 1) {
                requestAnimationFrame(updateFrame);
            } else {
                currentProgress = targetProgress;
                if (callback) callback();
            }
        }
        
        requestAnimationFrame(updateFrame);
    }
    
    function executeStep() {
        if (currentStep >= steps.length) {
            // Loading complete
            progressLabel.textContent = 'Loading Complete!';
            console.log('✅ Loading completed successfully!');
            
            setTimeout(() => {
                // Stop network background for loading screen
                if (networkBackground) {
                    networkBackground.stop();
                }
                
                // Fade out loading screen
                loadingScreen.style.opacity = '0';
                loadingScreen.style.transition = 'opacity 1s ease';
                
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    loadingScreen.classList.remove('active');
                    
                    // Show main menu
                    mainMenu.style.display = 'flex';
                    mainMenu.classList.add('active');
                    mainMenu.style.opacity = '0';
                    mainMenu.style.transition = 'opacity 1s ease';
                    
                    setTimeout(() => {
                        mainMenu.style.opacity = '1';
                    }, 50);
                    
                    console.log('🎮 Main menu displayed');
                }, 1000);
            }, 1000);
            return;
        }
        
        const step = steps[currentStep];
        progressLabel.textContent = step.text;
        
        console.log(`📋 Step ${currentStep + 1}/${steps.length}: ${step.text} -> ${step.progress}%`);
        
        animateToProgress(step.progress, step.duration, () => {
            currentStep++;
            setTimeout(executeStep, 200);
        });
    }
    
    // Start the loading process
    executeStep();
}

// Start loading when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, initializing network background...');
    
    // Debug: Check if canvas exists
    const canvas = document.getElementById('bg-canvas');
    console.log('Canvas element found:', canvas);
    if (canvas) {
        console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
        console.log('Canvas style:', canvas.style.cssText);
    }
    
    // Initialize network background immediately
    try {
        networkBackground = new SimpleNetworkBackground('bg-canvas');
        console.log('Network background created:', networkBackground);
        networkBackground.start();
        console.log('Network background started');
    } catch (error) {
        console.error('Error creating network background:', error);
    }
    
    console.log('📄 Starting loading in 1 second...');
    setTimeout(() => {
        startSimpleLoading();
    }, 1000);
});

// Manual controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen && loadingScreen.classList.contains('active')) {
            if (!loadingStarted) {
                console.log('🚨 Manual loading start triggered');
                startSimpleLoading();
            } else {
                console.log('⏭️ Skipping to main menu...');
                if (networkBackground) {
                    networkBackground.stop();
                }
                loadingScreen.style.display = 'none';
                const mainMenu = document.getElementById('main-menu');
                if (mainMenu) {
                    mainMenu.style.display = 'flex';
                    mainMenu.classList.add('active');
                }
            }
        }
    }
});

// Make functions and objects globally available for debugging
window.startSimpleLoading = startSimpleLoading;
window.networkBackground = networkBackground;