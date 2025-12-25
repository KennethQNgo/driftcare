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

// Recursively scan directory for media files
function scanDirectory(dir, baseDir = dir) {
    let results = [];
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            // Recursively scan subdirectory
            results = results.concat(scanDirectory(fullPath, baseDir));
        } else {
            const ext = path.extname(file).toLowerCase();
            if (VALID_EXTENSIONS.includes(ext)) {
                // Store relative path from base directory
                const relativePath = path.relative(baseDir, fullPath);
                results.push(`animals/${relativePath}`);
            }
        }
    }
    
    return results;
}

function generateManifest() {
    try {
        // Recursively scan for media files
        const mediaFiles = scanDirectory(MEDIA_DIR).sort();
        
        if (mediaFiles.length === 0) {
            console.warn('⚠️  No media files found in animals/ directory');
            return;
        }
        
        // Generate the JavaScript file content
        const content = `// Auto-generated media manifest
// Generated on: ${new Date().toISOString()}
// Total assets: ${mediaFiles.length}

window.mediaManifest = ${JSON.stringify(mediaFiles, null, 4)};
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
