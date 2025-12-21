# drift.care

A minimal sleep ritual web service. Visit, tap once, then enjoy calming audio with cute animal visuals that change every 5 seconds.

## Local Development

Open `index.html` directly in a browser, or use a simple HTTP server:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

## Deployment to Vercel

1. Install Vercel CLI (if not already installed):
```bash
npm install -g vercel
```

2. Deploy from the project directory:
```bash
cd drift.care
vercel
```

3. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Choose your account
   - Link to existing project? **N**
   - Project name? **drift-care** (or press enter)
   - In which directory is your code located? **./** (current directory)
   - Want to override the settings? **N**

4. Configure custom domain in Vercel dashboard:
   - Go to your project settings
   - Navigate to "Domains"
   - Add `drift.care`
   - Follow DNS configuration instructions to point your domain to Vercel

## Project Structure

```
drift.care/
├── index.html          # Main page
├── style.css           # Styling with fade transitions
├── script.js           # Visual cycling logic
└── public/
    ├── animals/        # 10 cute animal images
    │   └── animal1-10.jpg
    └── audio/
        └── calm.mp3    # Looping ambient audio
```

## Features

- ✅ Single tap to start
- ✅ Looping calm audio
- ✅ Visual changes every 5 seconds
- ✅ Smooth fade transitions
- ✅ Mobile & desktop friendly
- ✅ No accounts, no tracking, no complexity

## License

All animal images sourced from public APIs (dog.ceo). Audio is royalty-free sample content.
