# Manifest Validation Error Fix

## 🚨 **Problem**
You're getting "XML Schema Violation" when uploading the manifest with `localhost` URLs.

## 🔍 **Root Cause**
Office 365 Admin Center **does not accept `localhost` URLs** in manifests for security reasons. This is a common restriction in enterprise environments.

## ✅ **SOLUTION: Use GitHub Pages Manifest**

Instead of trying to use localhost URLs, let's use the GitHub Pages version which should pass validation.

### **Step 1: Try the GitHub Pages Manifest**

**Use this manifest:** `manifest.xml` (the main one)

This manifest:
- ✅ Uses `https://mfellsbbtv.github.io/starling-word-addin/` URLs
- ✅ Should pass XML schema validation
- ✅ Points to your deployed GitHub Pages site
- ✅ Has all the error fixes we implemented

### **Step 2: Upload Process**

1. **Remove old add-ins:**
   - In Word Online: Insert > Add-ins > My Add-ins
   - Remove any existing "Document Helper" or similar add-ins

2. **Clear browser cache:**
   - Ctrl+Shift+Delete (or Cmd+Shift+Delete)
   - Clear last hour

3. **Upload the GitHub manifest:**
   - Use `manifest.xml` (NOT the localhost version)
   - This should pass validation without errors

### **Step 3: Test the Add-in**

Once uploaded successfully:
1. Look for "RHEI AI Legal Assistant" in Word Online ribbon
2. Click "Show Taskpane" 
3. The add-in should load from GitHub Pages
4. Test if the error is resolved

## 🔧 **If GitHub Pages Version Still Has Errors**

If you still get the "Cannot read properties of undefined" error with the GitHub Pages version, then the issue is in the JavaScript code itself, not the manifest.

In that case, we can:

1. **Fix the GitHub Pages deployment** with the corrected JavaScript
2. **Use a hybrid approach** where manifest points to GitHub but files are served locally

## 📋 **Alternative Manifests to Try (in order)**

If `manifest.xml` doesn't work, try these in order:

1. **`manifest-fresh.xml`** - New GUID to bypass cache
2. **`manifest-word-online-compatible.xml`** - Maximum compatibility
3. **`manifest-local-simple.xml`** - Minimal localhost version (might work in some environments)

## 🎯 **Expected Result**

With `manifest.xml`:
- ✅ **Should pass validation** (no XML schema errors)
- ✅ **Should load the add-in** from GitHub Pages
- ✅ **Should show "RHEI AI Legal Assistant"** (not "Document Helper")

## 🚀 **Next Steps**

1. **Try uploading `manifest.xml`** first
2. **If it passes validation**, test the add-in functionality
3. **If you still get JavaScript errors**, we'll fix the GitHub Pages deployment
4. **If validation still fails**, we'll try the alternative manifests

The key insight is: **Office 365 Admin Center requires public HTTPS URLs, not localhost URLs** in manifests.

## 📝 **Quick Test**

**Upload:** `manifest.xml`
**Look for:** "RHEI AI Legal Assistant" 
**Expected:** No XML schema validation errors

Let me know if the validation passes with the GitHub Pages manifest!
