# Deployment Guide for drift.care

## Quick Deployment to Vercel (Recommended)

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not already installed):
```bash
npm install -g vercel
```

2. **Initialize Git repository** (if not already done):
```bash
cd /Users/kenneth.ngo/Projects/drift.care
git init
git add .
git commit -m "Initial commit - drift.care MVP"
```

3. **Deploy to Vercel**:
```bash
vercel
```

Follow the prompts:
- **Set up and deploy?** → Y
- **Which scope?** → Select your account
- **Link to existing project?** → N
- **Project name?** → drift-care (or press enter for default)
- **In which directory is your code located?** → ./ (current directory)
- **Want to override settings?** → N

4. **Deploy to production**:
```bash
vercel --prod
```

### Option 2: Deploy via GitHub + Vercel Dashboard

1. **Create a GitHub repository**:
```bash
cd /Users/kenneth.ngo/Projects/drift.care
git init
git add .
git commit -m "Initial commit - drift.care MVP"
gh repo create drift.care --public --source=. --remote=origin --push
```
(Or create manually at github.com/new)

2. **Link to Vercel**:
- Go to [vercel.com](https://vercel.com)
- Click "Import Project"
- Select your GitHub repository
- Click "Deploy"

## Configure Custom Domain

Once deployed, configure your custom domain `drift.care`:

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Domains**
3. Add domain: `drift.care`
4. Vercel will provide DNS configuration instructions

### DNS Configuration

Add these records to your domain registrar (e.g., Namecheap, GoDaddy):

**For apex domain (drift.care):**
- Type: `A`
- Host: `@`
- Value: `76.76.21.21` (Vercel's IP)

**For www subdomain:**
- Type: `CNAME`
- Host: `www`
- Value: `cname.vercel-dns.com`

**Note:** DNS propagation can take 24-48 hours, but is usually much faster.

## Verify Deployment

1. Visit your Vercel deployment URL (e.g., `https://drift-care.vercel.app`)
2. Once DNS is configured, visit `https://drift.care`
3. Tap "Start" to verify:
   - Audio plays and loops
   - Images change every 5 seconds
   - Smooth fade transitions work
   - Works on mobile and desktop

## Post-Deployment Checklist

- [ ] Site loads over HTTPS
- [ ] Custom domain resolves correctly
- [ ] Audio plays after tapping "Start"
- [ ] Visuals cycle every 5 seconds
- [ ] Fade transitions are smooth
- [ ] Mobile browser autoplay works (after user interaction)
- [ ] Desktop browser works in Chrome, Firefox, Safari
- [ ] No console errors

## Environment Variables

This project requires no environment variables or build configuration.

## Updating the Site

To deploy updates:

```bash
# Make your changes
git add .
git commit -m "Description of changes"
git push

# If using Vercel CLI
vercel --prod
```

Vercel will automatically rebuild and deploy when you push to your main branch.

## Troubleshooting

**Audio doesn't play:**
- Ensure you tap "Start" - browsers block autoplay without user interaction
- Check browser console for errors
- Verify calm.mp3 exists and is valid

**Images don't load:**
- Check that all animal1-10.jpg files exist in public/animals/
- Verify paths in script.js match actual filenames

**Domain not resolving:**
- Wait for DNS propagation (up to 48 hours)
- Verify DNS records in your registrar
- Use `dig drift.care` to check DNS records

## Local Development

```bash
cd /Users/kenneth.ngo/Projects/drift.care
python3 -m http.server 8000
# Visit http://localhost:8000
```

Or use any static server of your choice.
