# Setting Up "Manual Expo Template with Web" Repository

This guide will help you create a new GitHub repository for the web-compatible version of the template.

## Current Status

- ✅ All web support changes are committed to the `web-support` branch
- ✅ The `main` branch has been reset to the original state (without web support)

## Steps to Create the New Repository

### Option 1: Create New Repository on GitHub (Recommended)

1. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Repository name: `manuel-expo-template-with-web` (or your preferred name)
   - Description: "Manuel Expo Template with Web Platform Support"
   - Set it as **Public** (if you want it to be a template) or **Private**
   - Do NOT initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

2. **Push the web-support branch to the new repository:**
   ```bash
   # Add the new repository as a remote
   git remote add web-template https://github.com/Manny4C/manuel-expo-template-with-web.git
   
   # Push the web-support branch to the new repository
   git push web-template web-support:main
   ```

3. **Set the default branch on GitHub:**
   - Go to your new repository settings
   - Under "Default branch", change it to `main` if it's not already

### Option 2: Create Repository from Current Branch

If you prefer to create the repository locally first:

```bash
# Make sure you're on the web-support branch
git checkout web-support

# Create a new directory for the new repository
cd ..
git clone /Users/manuelcastro/manuel-expo-template manuel-expo-template-with-web
cd manuel-expo-template-with-web

# Remove the old remote and add the new one
git remote remove origin
git remote add origin https://github.com/Manny4C/manuel-expo-template-with-web.git

# Rename the branch to main
git branch -M main

# Push to the new repository
git push -u origin main
```

## Verify Everything Works

After setting up the new repository:

1. Clone the new repository in a fresh location:
   ```bash
   cd /tmp
   git clone https://github.com/Manny4C/manuel-expo-template-with-web.git test-web-template
   cd test-web-template
   npm install
   npm run web
   ```

2. Verify the home page shows "Welcome to Manuel's Template!" in the browser

## Original Template Status

The original `manuel-expo-template` repository remains unchanged on the `main` branch, without web support. You can continue using it for mobile-only projects.
