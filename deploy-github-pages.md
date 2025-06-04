# Deploy Starling Word Add-in to GitHub Pages

## Quick Setup Instructions

### 1. Create GitHub Repository
```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Initial commit: Starling Word Add-in"

# Create repository on GitHub and push
git remote add origin https://github.com/YOUR-USERNAME/starling-word-addin.git
git branch -M main
git push -u origin main
```

### 2. Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll to **Pages** section
4. Under **Source**, select **Deploy from a branch**
5. Select **main** branch and **/ (root)** folder
6. Click **Save**

### 3. Update Manifest URLs
Replace `your-username` in the manifest.xml with your actual GitHub username:
- `https://your-username.github.io/starling-word-addin/`

### 4. Deploy Files
Copy the contents of the `dist` folder to the root of your repository:
```bash
# Copy built files to root for GitHub Pages
cp -r dist/* .
git add .
git commit -m "Deploy to GitHub Pages"
git push
```

### 5. Test the Add-in
1. Wait 5-10 minutes for GitHub Pages to deploy
2. Visit: `https://YOUR-USERNAME.github.io/starling-word-addin/taskpane.html`
3. Upload the manifest.xml to Word Online

## Alternative: Use GitHub Actions for Automatic Deployment

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: word-addin/package-lock.json
    
    - name: Install dependencies
      run: |
        cd word-addin
        npm ci
    
    - name: Build
      run: |
        cd word-addin
        npm run build
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./word-addin/dist
```

## Troubleshooting

### SSL Certificate Issues
- GitHub Pages provides valid SSL certificates automatically
- No additional configuration needed for HTTPS

### CORS Issues
- GitHub Pages serves files with appropriate CORS headers
- Office add-ins should work without additional configuration

### Manifest Validation
- Test your manifest at: https://appsource.microsoft.com/en-us/marketplace/apps?product=office
- Use Office Add-in Validator tools online
