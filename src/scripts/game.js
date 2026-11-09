/* ===============================
   TestMe - Minimal JS Game Logic
   =============================== */

const gameState = {
    player: { x: 0, y: 0, speed: 4, direction: 'stop' },
    spots: [],
    currentSpot: null,
    currentActivity: null,
    isInActivity: false,
    isLoggedIn: false
};

function setUser(user) {
    // User data stored globally
};

function showScreen(screenName) {
    const authScreen = document.getElementById('auth-screen');
    const gameScreen = document.getElementById('game-screen');
    const rankingScreen = document.getElementById('ranking-screen');
    
    if (authScreen) authScreen.classList.add('hidden');
    if (gameScreen) gameScreen.classList.add('hidden');
    if (rankingScreen) rankingScreen.classList.add('hidden');
    
    if (screenName === 'auth') {
        if (authScreen) authScreen.classList.remove('hidden');
    } else if (screenName === 'game') {
        if (gameScreen) gameScreen.classList.remove('hidden');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const savedToken = localStorage.getItem('access_token');
    if (savedToken) {
        showScreen('game');
    } else {
        showScreen('auth');
    }
});
