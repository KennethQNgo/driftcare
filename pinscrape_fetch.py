#!/usr/bin/env python3
"""
Pinterest Asset Fetcher for drift.care

Downloads cute puppy/kitten images using pinscrape.
Based on the official pinscrape API examples.

Usage:
    python3 pinscrape_fetch.py "cute farm animals"
    python3 pinscrape_fetch.py "baby kittens" "adorable puppies"

Requirements:
    pip3 install pinscrape
"""

import os
import sys
from pinscrape import scraper, Pinterest

# ----------------------------------------------------------------------
# Configuration
# ----------------------------------------------------------------------
BASE_DIR = os.path.dirname(__file__)
ANIMALS_DIR = os.path.join(BASE_DIR, "animals")

proxies = {}
number_of_workers = 10
images_to_download = 100

# Search terms from command line or default
SEARCHES = sys.argv[1:] or ["cute farm animals"]

# ----------------------------------------------------------------------
def using_pinterest_apis(keyword, output_folder):
    """
    Uses Pinterest API directly - the recommended approach from pinscrape docs.
    """
    print(f"   📥 Using Pinterest API...")
    
    p = Pinterest(proxies=proxies, sleep_time=2)
    images_url = p.search(keyword, images_to_download)
    
    if images_url:
        print(f"   ✅ Found {len(images_url)} image URLs")
        p.download(url_list=images_url, number_of_workers=number_of_workers, output_folder=output_folder)
        print(f"   ✅ Downloaded {len(images_url)} images")
        return len(images_url)
    else:
        print(f"   ⚠️  No images found")
        return 0

# ----------------------------------------------------------------------
def using_search_engine(keyword, output_folder):
    """
    Uses scraper.scrape() - alternative method using search engine.
    """
    print(f"   📥 Using search engine scraper...")
    
    details = scraper.scrape(keyword, output_folder, proxies, number_of_workers, images_to_download, sleep_time=2)
    
    if details["isDownloaded"]:
        print(f"   ✅ Downloading completed!")
        print(f"   Total URLs found: {len(details['extracted_urls'])}")
        print(f"   Total images downloaded: {len(details['urls_list'])}")
        return len(details['urls_list'])
    else:
        print(f"   ⚠️  Nothing to download")
        print(f"   Details: {details}")
        return 0

# ----------------------------------------------------------------------
def main():
    """Main execution"""
    print("🐶🐱 Starting Pinterest asset fetch for drift.care...")
    print(f"📁 Base directory: {ANIMALS_DIR}\n")
    
    os.makedirs(ANIMALS_DIR, exist_ok=True)
    
    total_downloaded = 0
    
    for keyword in SEARCHES:
        subfolder = keyword.replace(" ", "_")
        output_folder = os.path.join(ANIMALS_DIR, subfolder)
        os.makedirs(output_folder, exist_ok=True)
        
        print(f"🔎 Fetching images for: '{keyword}'")
        print(f"   📁 Output folder: {output_folder}")
        
        try:
            # Try Pinterest API first (more reliable)
            count = using_pinterest_apis(keyword, output_folder)
            total_downloaded += count
            
        except Exception as e:
            print(f"   ❌ Pinterest API failed: {e}")
            print(f"   Trying search engine method...")
            
            try:
                # Fallback to search engine scraper
                count = using_search_engine(keyword, output_folder)
                total_downloaded += count
            except Exception as e2:
                print(f"   ❌ Search engine method also failed: {e2}")
        
        print()  # Blank line for readability
    
    # Summary
    print("=" * 60)
    print(f"🎉 Finished!")
    print(f"   Total images downloaded: {total_downloaded}")
    print("=" * 60)
    
    print("\n📝 Next steps:")
    print("   1. Review the images in drift.care/animals/")
    print("   2. Run: node generate-manifest.js")
    print("   3. Run: git add -A && git commit -m 'Add puppy/kitten assets' && git push")

if __name__ == "__main__":
    main()
