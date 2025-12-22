// ========================================
// Drift Concierge — State & Configuration
// ========================================

const state = {
    isStarted: false,
    isUiVisible: false,
    isStillMode: false,
    timerMinutes: 0,
    timerEndTimestamp: null,
    warmth: 30,
    dim: 20,
    volume: 50,
    activeLayerIndex: 0, // 0 or 1 for dual layers
    currentImageIndex: 0
};

const animalImages = [
    'animals/animal1.jpg',
    'animals/animal2.jpg',
    'animals/animal3.jpg',
    'animals/animal4.jpg',
    'animals/animal5.jpg',
    'animals/animal6.jpg',
    'animals/animal7.jpg',
    'animals/animal8.jpg',
    'animals/animal9.jpg',
    'animals/animal10.jpg'
];

let cycleInterval = null;
let uiHideTimeout = null;
let timerCheckInterval = null;

// ========================================
// DOM Elements
// ========================================

const app = document.getElementById('app');
const imageLayer1 = document.getElementById('imageLayer1');
const imageLayer2 = document.getElementById('imageLayer2');
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');
const dock = document.getElementById('dock');
const status = document.getElementById('status');
const bgAudio = document.getElementById('bgAudio');

// Filters
const warmthFilter = document.getElementById('warmthFilter');
const dimFilter = document.getElementById('dimFilter');
const fadeToBlack = document.getElementById('fadeToBlack');

// Controls
const timerButtons = document.querySelectorAll('.timer-btn');
const warmthSlider = document.getElementById('warmthSlider');
const dimSlider = document.getElementById('dimSlider');
const volumeSlider = document.getElementById('volumeSlider');
const stillToggle = document.getElementById('stillToggle');

// ========================================
// Initialization
// ========================================

function init() {
    // Set initial image
    imageLayer1.src = animalImages[0];
    
    // Set initial audio volume
    bgAudio.volume = state.volume / 100;
    
    // Apply initial filters
    updateFilters();
    
    // Bind event listeners
    bindEvents();
    
    // Show app with fade-in
    setTimeout(() => {
        app.classList.add('visible');
    }, 100);
}

// ========================================
// Event Bindings
// ========================================

function bindEvents() {
    // Start button
    startBtn.addEventListener('click', startSession);
    
    // Timer buttons
    timerButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const minutes = parseInt(btn.dataset.minutes);
            setTimer(minutes);
        });
    });
    
    // Sliders
    warmthSlider.addEventListener('input', (e) => {
        state.warmth = parseInt(e.target.value);
        updateFilters();
    });
    
    dimSlider.addEventListener('input', (e) => {
        state.dim = parseInt(e.target.value);
        updateFilters();
    });
    
    volumeSlider.addEventListener('input', (e) => {
        state.volume = parseInt(e.target.value);
        bgAudio.volume = state.volume / 100;
    });
    
    // Still mode toggle
    stillToggle.addEventListener('click', toggleStillMode);
    
    // Show UI on interaction
    document.addEventListener('click', showUiTemporarily);
    document.addEventListener('mousemove', showUiTemporarily);
    document.addEventListener('keydown', showUiTemporarily);
}

// ========================================
// Session Control
// ========================================

function startSession() {
    if (state.isStarted) return;
    
    state.isStarted = true;
    
    // Hide start screen
    startScreen.classList.add('hidden');
    
    // Show status
    showStatus('drifting');
    
    // Fade in audio over 4 seconds
    fadeInAudio(4000);
    
    // Start image cycling after a brief moment
    setTimeout(() => {
        startCycling();
    }, 1000);
    
    // Show controls briefly then auto-hide
    showUiTemporarily();
}

function fadeInAudio(duration) {
    bgAudio.volume = 0;
    bgAudio.play().catch(err => console.error('Audio playback failed:', err));
    
    const targetVolume = state.volume / 100;
    const step = targetVolume / (duration / 50);
    
    const fadeInterval = setInterval(() => {
        if (bgAudio.volume < targetVolume - step) {
            bgAudio.volume = Math.min(bgAudio.volume + step, targetVolume);
        } else {
            bgAudio.volume = targetVolume;
            clearInterval(fadeInterval);
        }
    }, 50);
}

// ========================================
// Image Cycling with Crossfade
// ========================================

function startCycling() {
    if (cycleInterval) clearInterval(cycleInterval);
    
    cycleInterval = setInterval(() => {
        if (!state.isStillMode) {
            nextScene();
        }
    }, 5000);
}

function nextScene() {
    // Move to next image
    state.currentImageIndex = (state.currentImageIndex + 1) % animalImages.length;
    const nextImageSrc = animalImages[state.currentImageIndex];
    
    // Determine which layer is currently active
    const currentLayer = state.activeLayerIndex === 0 ? imageLayer1 : imageLayer2;
    const nextLayer = state.activeLayerIndex === 0 ? imageLayer2 : imageLayer1;
    
    // Preload next image
    const preloadImg = new Image();
    preloadImg.onload = () => {
        // Set source on inactive layer
        nextLayer.src = preloadImg.src;
        
        // Wait a frame for DOM update
        requestAnimationFrame(() => {
            // Crossfade: activate next, deactivate current
            nextLayer.classList.add('active');
            currentLayer.classList.remove('active');
            
            // Swap active index
            state.activeLayerIndex = state.activeLayerIndex === 0 ? 1 : 0;
        });
    };
    
    preloadImg.onerror = () => {
        console.error('Failed to load image:', nextImageSrc);
    };
    
    preloadImg.src = nextImageSrc;
}

// ========================================
// UI Visibility (Auto-hide)
// ========================================

function showUiTemporarily() {
    if (!state.isStarted) return;
    
    // Show dock
    dock.classList.add('visible');
    state.isUiVisible = true;
    
    // Clear existing timeout
    if (uiHideTimeout) clearTimeout(uiHideTimeout);
    
    // Auto-hide after 4 seconds
    uiHideTimeout = setTimeout(() => {
        dock.classList.remove('visible');
        state.isUiVisible = false;
    }, 4000);
}

// ========================================
// Timer Functionality
// ========================================

function setTimer(minutes) {
    // Update UI
    timerButtons.forEach(btn => {
        const btnMinutes = parseInt(btn.dataset.minutes);
        if (btnMinutes === minutes) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Clear existing timer
    if (timerCheckInterval) {
        clearInterval(timerCheckInterval);
        timerCheckInterval = null;
    }
    
    state.timerMinutes = minutes;
    
    if (minutes === 0) {
        state.timerEndTimestamp = null;
        fadeToBlack.classList.remove('active');
        return;
    }
    
    // Set end timestamp
    state.timerEndTimestamp = Date.now() + (minutes * 60 * 1000);
    
    // Check timer every second
    timerCheckInterval = setInterval(checkTimer, 1000);
}

function checkTimer() {
    if (!state.timerEndTimestamp) return;
    
    const now = Date.now();
    const remaining = state.timerEndTimestamp - now;
    
    // Show "ending soon" at 30 seconds remaining
    if (remaining <= 30000 && remaining > 29000) {
        showStatus('ending soon');
    }
    
    // End session when timer expires
    if (remaining <= 0) {
        endSession();
    }
}

function endSession() {
    // Clear intervals
    if (timerCheckInterval) {
        clearInterval(timerCheckInterval);
        timerCheckInterval = null;
    }
    
    if (cycleInterval) {
        clearInterval(cycleInterval);
        cycleInterval = null;
    }
    
    // Fade to black
    fadeToBlack.classList.add('active');
    
    // Fade out audio over 6 seconds
    fadeOutAudio(6000);
    
    showStatus('rest well');
}

function fadeOutAudio(duration) {
    const startVolume = bgAudio.volume;
    const step = startVolume / (duration / 50);
    
    const fadeInterval = setInterval(() => {
        if (bgAudio.volume > step) {
            bgAudio.volume = Math.max(bgAudio.volume - step, 0);
        } else {
            bgAudio.volume = 0;
            bgAudio.pause();
            clearInterval(fadeInterval);
        }
    }, 50);
}

// ========================================
// Still Mode Toggle
// ========================================

function toggleStillMode() {
    state.isStillMode = !state.isStillMode;
    stillToggle.classList.toggle('active', state.isStillMode);
    
    if (state.isStillMode) {
        showStatus('still');
    }
}

// ========================================
// Night Filters
// ========================================

function updateFilters() {
    // Warmth filter
    warmthFilter.style.opacity = state.warmth / 100;
    
    // Dim filter
    dimFilter.style.opacity = state.dim / 100;
}

// ========================================
// Status Messages
// ========================================

function showStatus(message) {
    status.textContent = message;
    status.classList.add('visible');
    
    setTimeout(() => {
        status.classList.remove('visible');
    }, 2000);
}

// ========================================
// Visibility Change Handler
// ========================================

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        bgAudio.pause();
    } else if (state.isStarted) {
        bgAudio.play().catch(err => console.error('Resume failed:', err));
    }
});

// ========================================
// Start Application
// ========================================

init();
