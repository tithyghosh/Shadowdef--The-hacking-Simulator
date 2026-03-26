const LOGIN_ICON_SVG = `
    <svg class="icon-svg" viewBox="0 0 24 24">
        <path d="M14 4h7v16h-7"></path>
        <path d="M3 12h10"></path>
        <path d="m9 8 4 4-4 4"></path>
    </svg>
`;

const LOGOUT_ICON_SVG = `
    <svg class="icon-svg" viewBox="0 0 24 24">
        <path d="M12 4v7"></path>
        <path d="M7.5 6.2a8 8 0 1 0 9 0"></path>
    </svg>
`;

function setLoginButtonIcon(button, iconSvg) {
    const iconContainer = button?.querySelector('.card-icon');
    if (iconContainer) {
        iconContainer.innerHTML = iconSvg;
    }
}

export function updateMainMenuAuthState({ isAuthenticated = false, user = null } = {}) {
    const loginLogoutBtn = document.getElementById('login-logout-btn');
    const profileBtn = document.querySelector('[data-action="profile"]');
    const profileStats = document.getElementById('profile-stats');
    const missionProgress = document.getElementById('mission-progress');
    const operatorLabel = document.getElementById('main-menu-operator');

    if (loginLogoutBtn) {
        const title = loginLogoutBtn.querySelector('.card-title');
        const subtitle = loginLogoutBtn.querySelector('.card-subtitle');
        const tip = loginLogoutBtn.querySelector('.main-menu-dock-tip');

        if (isAuthenticated) {
            loginLogoutBtn.dataset.tooltip = 'Logout Module';
            loginLogoutBtn.setAttribute('aria-label', 'Logout');
            loginLogoutBtn.classList.add('is-logout');
            setLoginButtonIcon(loginLogoutBtn, LOGOUT_ICON_SVG);
            if (title) title.textContent = 'LOGOUT';
            if (subtitle) subtitle.textContent = 'End session / secure sign out';
            if (tip) tip.textContent = 'LOGOUT';
        } else {
            loginLogoutBtn.dataset.tooltip = 'Login Module';
            loginLogoutBtn.setAttribute('aria-label', 'Login');
            loginLogoutBtn.classList.remove('is-logout');
            setLoginButtonIcon(loginLogoutBtn, LOGIN_ICON_SVG);
            if (title) title.textContent = 'LOGIN';
            if (subtitle) subtitle.textContent = 'Terminal access / operator auth';
            if (tip) tip.textContent = 'LOGIN';
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
