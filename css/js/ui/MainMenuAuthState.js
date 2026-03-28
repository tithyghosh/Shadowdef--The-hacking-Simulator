function setLoginButtonIcon(button, markup) {
    const iconContainer = button?.querySelector('#login-emoji, .anode-emoji');
    if (iconContainer) {
        iconContainer.innerHTML = markup;
    }
}

export function updateMainMenuAuthState({ isAuthenticated = false, user = null } = {}) {
    const loginLogoutBtn = document.getElementById('login-logout-btn');
    const profileBtn = document.querySelector('[data-action="profile"]');
    const profileStats = document.getElementById('profile-stats');
    const missionProgress = document.getElementById('mission-progress');
    const operatorLabel = document.getElementById('main-menu-operator');
    const loginLabel = document.getElementById('login-label');

    if (loginLogoutBtn) {
        if (isAuthenticated) {
            loginLogoutBtn.dataset.tooltip = 'Logout Module';
            loginLogoutBtn.setAttribute('aria-label', 'Logout');
            loginLogoutBtn.classList.add('is-logout');
            setLoginButtonIcon(loginLogoutBtn, '<svg viewBox="0 0 24 24"><path d="M8 6h8v12H8z"></path><path d="M12 9v6M9 12h6"></path></svg>');
            if (loginLabel) loginLabel.textContent = 'LOGOUT';
        } else {
            loginLogoutBtn.dataset.tooltip = 'Login Module';
            loginLogoutBtn.setAttribute('aria-label', 'Login');
            loginLogoutBtn.classList.remove('is-logout');
            setLoginButtonIcon(loginLogoutBtn, '<svg viewBox="0 0 24 24"><path d="M7 5.5h10v13H7z"></path><path d="M9.5 9h5M9.5 12h5M9.5 15h3.5"></path></svg>');
            if (loginLabel) loginLabel.textContent = 'GUIDE';
        }
    }

    if (profileBtn) {
        profileBtn.dataset.tooltip = 'Profile Module';
        profileBtn.setAttribute('aria-label', 'Profile');
    }

    if (isAuthenticated && user) {
        const stats = user.gameStats || {};
        const operatorName = user.displayName || user.name || user.email || 'OPERATOR';
        if (profileStats) {
            profileStats.textContent = `Level ${stats.level || 1} - ${stats.credits || 0} Credits`;
        }
        if (missionProgress) {
            missionProgress.textContent = `${stats.missionsCompleted || 0}/20 Completed`;
        }
        if (operatorLabel) {
            operatorLabel.textContent = operatorName.toUpperCase();
        }
        return;
    }

    if (profileStats) profileStats.textContent = 'Login to view profile';
    if (missionProgress) missionProgress.textContent = '0/20 Completed';
    if (operatorLabel) operatorLabel.textContent = 'GUEST';
}
