// Array of animal image paths
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

let currentIndex = 0;
let intervalId = null;

// DOM elements
const animalImg = document.getElementById('animal');
const startBtn = document.getElementById('startBtn');
const bgAudio = document.getElementById('bgAudio');

// Preload the first image
animalImg.src = animalImages[0];

// Start button click handler
startBtn.addEventListener('click', () => {
    // Start audio playback
    bgAudio.play().catch(err => {
        console.error('Audio playback failed:', err);
    });
    
    // Hide the start button
    startBtn.classList.add('hidden');
    
    // Start the visual cycling
    startCycling();
});

// Function to cycle to the next image
function cycleImage() {
    // Move to next index
    currentIndex = (currentIndex + 1) % animalImages.length;
    
    const nextImage = new Image();
    nextImage.onload = () => {
        // Smooth transition: fade out, swap, fade in
        animalImg.style.opacity = '0';
        
        setTimeout(() => {
            animalImg.src = nextImage.src;
            animalImg.style.opacity = '1';
        }, 400); // Half of the CSS transition time
    };
    
    nextImage.onerror = () => {
        console.error('Failed to load image:', animalImages[currentIndex]);
        // Continue cycling even if one image fails
    };
    
    nextImage.src = animalImages[currentIndex];
}

// Start the cycling interval
function startCycling() {
    // Cycle every 5 seconds
    intervalId = setInterval(cycleImage, 5000);
}

// Optional: Handle visibility change to pause/resume when tab is hidden
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        bgAudio.pause();
    } else if (intervalId !== null) {
        bgAudio.play().catch(err => console.error('Resume failed:', err));
    }
});
