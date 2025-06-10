# Manifest Files Guide

## 📁 **CURRENT ACTIVE MANIFESTS** (Use These)

### **✅ WORKING MANIFEST** ⭐ **USE THIS ONE**
**File:** `manifest-working.xml`
- **Status:** ✅ **CONFIRMED WORKING** - Passes Office 365 validation
- **Points to:** `https://mfellsbbtv.github.io/starling-word-addin/`
- **Features:** All features, production ready
- **GUID:** `12345678-1234-5678-9012-123456789014` (Valid format)
- **Name:** "RHEI AI Legal Assistant"

### **For Local Development** 🔧
**File:** `manifest-dev-local.xml`
- **Use when:** Running local server (`npm run start`)
- **Points to:** `https://localhost:3000/`
- **Features:** All features, local debugging
- **GUID:** `local123-4567-8901-abcd-ef1234567890`
- **Name:** "RHEI AI Legal Assistant (Local)"
- **Status:** ❌ May fail due to localhost URLs

### **For GitHub Pages Deployment** 🌐
**File:** `manifest.xml`
- **Use when:** Deploying to production via GitHub Pages
- **Points to:** `https://mfellsbbtv.github.io/starling-word-addin/`
- **Features:** All features, production ready
- **GUID:** `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
- **Name:** "RHEI AI Legal Assistant"
- **Status:** ❌ May fail due to GUID format

### **For Maximum Compatibility** ✅
**File:** `manifest-word-online-compatible.xml`
- **Use when:** Having issues with Word Online compatibility
- **Points to:** `https://mfellsbbtv.github.io/starling-word-addin/`
- **Features:** Minimal requirements, maximum compatibility
- **GUID:** `12345678-1234-1234-1234-123456789012`
- **Name:** "RHEI AI Legal Assistant"
- **Status:** ❓ May work (similar GUID format)

### **For Fresh Install** 🆕
**File:** `manifest-fresh.xml`
- **Use when:** Need to bypass caching issues
- **Points to:** `https://mfellsbbtv.github.io/starling-word-addin/`
- **Features:** All features, new GUID to avoid cache
- **GUID:** `f9e8d7c6-b5a4-3210-9876-543210fedcba`
- **Name:** "RHEI AI Legal Assistant"
- **Status:** ❌ May fail due to GUID format

---

## 🗂️ **ARCHIVED MANIFESTS** (Don't Use)

All old/experimental manifest files have been moved to `manifest-archive/` folder:
- `manifest-dev-simple.xml`
- `manifest-github-dev.xml`
- `manifest-hybrid.xml`
- `manifest-minimal-org.xml`
- `manifest-new-guid.xml`
- `manifest-numeric-guid.xml`
- `manifest-org-compliant.xml`
- `manifest-ultra-minimal.xml`
- `manifest-valid-guid.xml`
- `manifest-word-online.xml`
- `manifest-org-compliant.txt`

---

## 🎯 **WHICH MANIFEST TO USE?**

### **✅ CURRENT RECOMMENDATION**

**USE:** `manifest-working.xml` ⭐

**Why this one works:**
- ✅ **Confirmed working** - You successfully uploaded this format
- ✅ **Valid GUID format** - Uses `12345678-1234-5678-9012-123456789014`
- ✅ **Simple structure** - No complex elements that cause validation issues
- ✅ **Correct name** - Shows "RHEI AI Legal Assistant" (not "Document Helper")
- ✅ **GitHub Pages URLs** - Points to your working deployment

**Steps:**
1. Remove any existing add-ins from Word Online
2. Upload `manifest-working.xml`
3. Look for "RHEI AI Legal Assistant" in the ribbon
4. Test the add-in functionality

### **🔍 KEY DISCOVERY**
The issue was **GUID format validation**! Office 365 is very strict about GUID formats:
- ✅ **Works:** `12345678-1234-5678-9012-123456789012` (standard pattern)
- ❌ **Fails:** `a1b2c3d4-e5f6-7890-abcd-ef1234567890` (mixed letters/numbers)
- ❌ **Fails:** `local123-4567-8901-abcd-ef1234567890` (non-standard format)

---

## 🔧 **Local Server Setup**

Your local server should be running at: `https://localhost:3000/`

**To start:** `npm run start`
**To stop:** `Ctrl+C` in the terminal

**Files served:**
- HTML: `taskpane-local.html` (simple version without dynamic imports)
- JS: `src/taskpane/taskpane-simple.js` (no module loading issues)
- Manifest: `manifest-dev-local.xml`

---

## 🚀 **Quick Reference**

| Scenario | Manifest File | Server | Notes |
|----------|---------------|---------|-------|
| **Local Development** | `manifest-dev-local.xml` | `localhost:3000` | ✅ **Use This Now** |
| **Production** | `manifest.xml` | GitHub Pages | For future use |
| **Compatibility Issues** | `manifest-word-online-compatible.xml` | GitHub Pages | Fallback option |
| **Cache Problems** | `manifest-fresh.xml` | GitHub Pages | New GUID |

---

## 📝 **Notes**

- **All archived manifests** are in `manifest-archive/` folder
- **Only 4 active manifests** remain in root directory
- **Local development** uses simplified JavaScript to avoid module loading issues
- **Each manifest has unique GUID** to prevent caching conflicts

**Current Recommendation:** Use `manifest-dev-local.xml` with your local server running!
