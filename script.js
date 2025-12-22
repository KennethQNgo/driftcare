// ========================================
// Drift - Clean & Minimal
// ========================================

const state = {
    isStarted: false,
    activeLayerIndex: 0,
    currentImageIndex: 0
};

let cycleInterval = null;

// ========================================
// DOM Elements
// ========================================

const app = document.getElementById('app');
const wordmark = document.getElementById('wordmark');
const imageLayer1 = document.getElementById('imageLayer1');
const imageLayer2 = document.getElementById('imageLayer2');
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');
const bgAudio = document.getElementById('bgAudio');

// ========================================
// Load Media Assets
// ========================================

async function loadMediaAssets() {
    try {
        // Load the manifest script
        const manifestScript = document.createElement('script');
        manifestScript.src = 'mediaManifest.js';
        await new Promise((resolve, reject) => {
            manifestScript.onload = resolve;
            manifestScript.onerror = reject;
            document.head.appendChild(manifestScript);
        });
        
        console.log(`✅ Loaded ${window.mediaManifest.length} media assets`);
        
    } catch (error) {
        console.warn('⚠️ Could not load manifest, using fallback');
        // Fallback: scan animals directory manually
        window.mediaManifest = [
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
    }
}

// ========================================
// Initialization
// ========================================

async function init() {
    // Load media assets first
    await loadMediaAssets();
    
    // Set initial image
    if (window.mediaManifest && window.mediaManifest.length > 0) {
        imageLayer1.src = window.mediaManifest[0];
        imageLayer1.classList.add('active');
    }
    
    // Bind events
    bindEvents();
    
    // Fade in app
    setTimeout(() => {
        app.classList.add('visible');
    }, 100);
}

// ========================================
// Event Bindings
// ========================================

function bindEvents() {
    startBtn.addEventListener('click', startSession);
}

// ========================================
// Session Control
// ========================================

function startSession() {
    if (state.isStarted) return;
    
    state.isStarted = true;
    
    // Hide start screen
    startScreen.classList.add('hidden');
    
    // Fade in audio over 4 seconds
    fadeInAudio(4000);
    
    // Fade wordmark to subtle
    setTimeout(() => {
        wordmark.classList.add('subtle');
    }, 2000);
    
    // Start image cycling after 5 seconds (breathing animation delay)
    setTimeout(() => {
        startCycling();
        console.log('🌙 Breathing cycle started');
    }, 5000);
}

function fadeInAudio(duration) {
    bgAudio.volume =0;
    bgAudio.play().catch(err => console.error('Audio playback failed:', err));
    
    const targetVolume = 0.5; // Set to 50% volume
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
    
    // Cycle every 10 seconds to match breathing animation
    cycleInterval = setInterval(() => {
        nextScene();
    }, 10000);
}

function nextScene() {
    if (!window.mediaManifest || window.mediaManifest.length === 0) return;
    
    // Move to next image
    state.currentImageIndex = (state.currentImageIndex + 1) % window.mediaManifest.length;
    const nextImageSrc = window.mediaManifest[state.currentImageIndex];
    
    // Determine layers
    const currentLayer = state.activeLayerIndex === 0 ? imageLayer1 : imageLayer2;
    const nextLayer = state.activeLayerIndex === 0 ? imageLayer2 : imageLayer1;
    
    // Preload next image
    const preloadImg = new Image();
    preloadImg.onload = () => {
        nextLayer.src = preloadImg.src;
        
        requestAnimationFrame(() => {
            // Crossfade
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
