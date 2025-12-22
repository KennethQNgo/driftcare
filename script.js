// ========================================
// Drift Concierge v2 — State & Config
// ========================================

const state = {
    isStarted: false,
    isDrawerOpen: false,
    isStillMode: false,
    warmth: 40,
    dim: 30,
    volume: 50,
    activeLayerIndex: 0,
    currentImageIndex: 0
};

// Media assets and focus positions
let mediaManifest = [];
let mediaFocusMap = {};

let cycleInterval = null;

// ========================================
// DOM Elements
// ========================================

const app = document.getElementById('app');
const wordmark = document.getElementById('wordmark');
const pillLabel = document.getElementById('pill-label');
const heroHeadline = document.getElementById('hero-headline');
const imageLayer1 = document.getElementById('imageLayer1');
const imageLayer2 = document.getElementById('imageLayer2');
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');
const conciergeCopy = document.getElementById('concierge-copy');
const conciergeTrigger = document.getElementById('concierge-trigger');
const drawer = document.getElementById('drawer');
const drawerOverlay = document.getElementById('drawer-overlay');
const status = document.getElementById('status');
const bgAudio = document.getElementById('bgAudio');

// Filters
const warmthFilter = document.getElementById('warmthFilter');
const dimFilter = document.getElementById('dimFilter');
const brightnessFilter = document.getElementById('brightnessFilter');

// Controls
const warmthSlider = document.getElementById('warmthSlider');
const dimSlider = document.getElementById('dimSlider');
const volumeSlider = document.getElementById('volumeSlider');
const stillToggle = document.getElementById('stillToggle');

// ========================================
// Load Media Assets
// ========================================

async function loadMediaAssets() {
    try {
        // Load manifest
        const manifestScript = document.createElement('script');
        manifestScript.src = 'mediaManifest.js';
        await new Promise((resolve, reject) => {
            manifestScript.onload = resolve;
            manifestScript.onerror = reject;
            document.head.appendChild(manifestScript);
        });
        
        // mediaManifest is now in global scope from the loaded script
        
        // Load focus map
        const focusResponse = await fetch('mediaFocus.json');
        mediaFocusMap = await focusResponse.json();
        
        console.log(`✅ Loaded ${mediaManifest.length} media assets`);
        
    } catch (error) {
        console.warn('⚠️ Could not load media assets, using fallback');
        // Fallback to hardcoded list
        mediaManifest = [
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
// Apply Focus Position (Face-Centering)
// ========================================

function applyFocusPosition(imgElement, imageSrc) {
    const focusPosition = mediaFocusMap[imageSrc];
    if (focusPosition && !focusPosition.startsWith('_')) {
        imgElement.style.objectPosition = focusPosition;
    } else {
        imgElement.style.objectPosition = 'center center';
    }
}

// ========================================
// Initialization
// ========================================

async function init() {
    // Load media assets first
    await loadMediaAssets();
    
    // Set initial image
    if (mediaManifest.length > 0) {
        imageLayer1.src = mediaManifest[0];
        applyFocusPosition(imageLayer1, mediaManifest[0]);
        imageLayer1.classList.add('active');
    }
    
    // Set initial audio volume
    bgAudio.volume = state.volume / 100;
    
    // Apply initial filters
    updateFilters();
    
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
    // Start button
    startBtn.addEventListener('click', startSession);
    
    // Concierge trigger
    conciergeTrigger.addEventListener('click', toggleDrawer);
    
    // Drawer overlay (click to close)
    drawerOverlay.addEventListener('click', closeDrawer);
    
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
    
    // Show status briefly
    showStatus('drifting');
    
    // Fade wordmark to subtle
    setTimeout(() => {
        wordmark.classList.add('subtle');
    }, 2000);
    
    // Hide pill label after 4 seconds
    setTimeout(() => {
        pillLabel.classList.add('hidden');
    }, 4000);
    
    // Hide hero headline after 5 seconds
    setTimeout(() => {
        heroHeadline.classList.add('hidden');
    }, 5000);
    
    // Show concierge trigger after 3 seconds
    setTimeout(() => {
        conciergeTrigger.classList.add('visible');
    }, 3000);
    
    // Start image cycling
    setTimeout(() => {
        startCycling();
    }, 1000);
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
    // Move to next image using manifest
    state.currentImageIndex = (state.currentImageIndex + 1) % mediaManifest.length;
    const nextImageSrc = mediaManifest[state.currentImageIndex];
    
    // Determine layers
    const currentLayer = state.activeLayerIndex === 0 ? imageLayer1 : imageLayer2;
    const nextLayer = state.activeLayerIndex === 0 ? imageLayer2 : imageLayer1;
    
    // Preload next image
    const preloadImg = new Image();
    preloadImg.onload = () => {
        nextLayer.src = preloadImg.src;
        
        // Apply focus position for face-centering
        applyFocusPosition(nextLayer, nextImageSrc);
        
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
// Drawer Control
// ========================================

function toggleDrawer() {
    if (state.isDrawerOpen) {
        closeDrawer();
    } else {
        openDrawer();
    }
}

function openDrawer() {
    state.isDrawerOpen = true;
    drawer.classList.add('open');
    drawerOverlay.classList.add('visible');
}

function closeDrawer() {
    state.isDrawerOpen = false;
    drawer.classList.remove('open');
    drawerOverlay.classList.remove('visible');
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
// Enhanced Night Filters
// ========================================

function updateFilters() {
    // Warmth: enhanced to be very noticeable
    // Range 0-100, but we map it to 0-0.6 for strong effect
    const warmthIntensity = (state.warmth / 100) * 0.6;
    warmthFilter.style.opacity = warmthIntensity;
    
    // Dim: dual approach - vignette + brightness reduction
    // Vignette intensity
    const dimVignetteIntensity = (state.dim / 100) * 0.7;
    dimFilter.style.opacity = dimVignetteIntensity;
    
    // Brightness reduction (separate layer)
    const brightnessIntensity = (state.dim / 100) * 0.4;
    brightnessFilter.style.opacity = brightnessIntensity;
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
