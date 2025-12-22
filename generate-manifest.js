#!/usr/bin/env node

/**
 * Generate Media Manifest
 * 
 * This script scans the animals/ directory and generates a mediaManifest.js file
 * with all image/video assets. Run this whenever you add new media files.
 * 
 * Usage: node generate-manifest.js
 */

const fs = require('fs');
const path = require('path');

const MEDIA_DIR = path.join(__dirname, 'animals');
const OUTPUT_FILE = path.join(__dirname, 'mediaManifest.js');

// Supported file extensions
const VALID_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.webm', '.webp'];

function generateManifest() {
    try {
        // Read all files from the animals directory
        const files = fs.readdirSync(MEDIA_DIR);
        
        // Filter for valid media files only
        const mediaFiles = files
            .filter(file => {
                const ext = path.extname(file).toLowerCase();
                return VALID_EXTENSIONS.includes(ext);
            })
            .sort() // Sort alphabetically for consistency
            .map(file => `animals/${file}`);
        
        if (mediaFiles.length === 0) {
            console.warn('⚠️  No media files found in animals/ directory');
            return;
        }
        
        // Generate the JavaScript file content
        const content = `// Auto-generated media manifest
// Generated on: ${new Date().toISOString()}
// Total assets: ${mediaFiles.length}

const mediaManifest = ${JSON.stringify(mediaFiles, null, 4)};

// Export for use in script.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = mediaManifest;
}
`;
        
        // Write to file
        fs.writeFileSync(OUTPUT_FILE, content, 'utf8');
        
        console.log('✅ Media manifest generated successfully!');
        console.log(`📁 Found ${mediaFiles.length} media files:`);
        mediaFiles.forEach(file => console.log(`   - ${file}`));
        console.log(`💾 Saved to: ${OUTPUT_FILE}`);
        
    } catch (error) {
        console.error('❌ Error generating manifest:', error.message);
        process.exit(1);
    }
}

// Run the generator
generateManifest();
