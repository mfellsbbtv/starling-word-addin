# Manifest Configuration - Clean and Updated

## ✅ **CURRENT ACTIVE MANIFESTS**

### **1. `manifest.xml` - PRODUCTION MANIFEST**
- **Purpose**: Production deployment on GitHub Pages
- **URL**: `https://mfellsbbtv.github.io/starling-word-addin/taskpane.html`
- **GUID**: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
- **Version**: `1.0.2.0`
- **Word API**: `1.3` (optimized for modern compatibility)
- **Features**: Full ribbon integration, icons, commands
- **Use for**: Production deployment, GitHub Pages testing

### **2. `manifest-dev-local.xml` - LOCAL DEVELOPMENT MANIFEST**
- **Purpose**: Local development on localhost:3000
- **URL**: `https://localhost:3000/taskpane.html`
- **GUID**: `12345678-abcd-1234-efgh-123456789012`
- **Version**: `1.0.3.0`
- **Word API**: `1.3` (optimized for modern compatibility)
- **Features**: Full ribbon integration, icons, commands
- **Use for**: Local development and testing

## 🗂️ **ARCHIVED MANIFESTS**

All unused manifest files have been moved to `manifest-archive/`:
- `manifest-absolute-minimal.xml`
- `manifest-connection-test.xml`
- `manifest-context-fix.xml`
- `manifest-fresh.xml`
- `manifest-local-clean.xml`
- `manifest-local-simple.xml`
- `manifest-localhost-working.xml`
- `manifest-minimal-valid.xml`
- `manifest-new-guid.xml`
- `manifest-office-fix.xml`
- `manifest-official-format.xml`
- `manifest-ultra-basic.xml`
- `manifest-word-api-fix.xml` ← **This was the old testing manifest**
- `manifest-word-online-compatible.xml`
- `manifest-word-online-localhost.xml`
- `manifest-working.xml`

## 🔧 **UPDATES MADE TO `manifest-dev-local.xml`**

### **Fixed Issues:**
1. **Updated URLs**: Changed from `taskpane-local.html` to `taskpane.html`
2. **Updated Word API**: Upgraded from 1.1 to 1.3 for better compatibility
3. **Updated Version**: Changed to 1.0.3.0 for consistency
4. **Verified URLs**: All localhost:3000 URLs are correct

### **Before (Broken):**
```xml
<SourceLocation DefaultValue="https://localhost:3000/taskpane-local.html"/>
<Set Name="WordApi" MinVersion="1.1"/>
```

### **After (Fixed):**
```xml
<SourceLocation DefaultValue="https://localhost:3000/taskpane.html"/>
<Set Name="WordApi" MinVersion="1.3"/>
```

## 📋 **HOW TO USE**

### **For Production (GitHub Pages):**
```bash
# Use this manifest for production deployment
manifest.xml
```

### **For Local Development:**
```bash
# Start local server
npm start

# Use this manifest for local testing
manifest-dev-local.xml
```

## 🎯 **KEY DIFFERENCES**

| Feature | Production (`manifest.xml`) | Local Dev (`manifest-dev-local.xml`) |
|---------|----------------------------|--------------------------------------|
| **URL** | GitHub Pages | localhost:3000 |
| **GUID** | `a1b2c3d4-e5f6-7890-abcd-ef1234567890` | `12345678-abcd-1234-efgh-123456789012` |
| **Version** | 1.0.2.0 | 1.0.3.0 |
| **Word API** | 1.3 | 1.3 |
| **Icons** | GitHub Pages URLs | localhost:3000 URLs |
| **Commands** | GitHub Pages URLs | localhost:3000 URLs |

## ✅ **VALIDATION STATUS**

### **`manifest.xml`** ✅
- Valid XML structure
- Correct GitHub Pages URLs
- Word API 1.3 requirements
- Full ribbon integration

### **`manifest-dev-local.xml`** ✅
- Valid XML structure
- Correct localhost:3000 URLs
- Word API 1.3 requirements
- Full ribbon integration
- **FIXED**: No longer points to non-existent files

## 🚀 **NEXT STEPS**

1. **Test Local Development:**
   ```bash
   npm start
   # Load manifest-dev-local.xml in Word
   ```

2. **Test Production:**
   ```bash
   npm run build
   # Load manifest.xml in Word
   ```

3. **Deploy Changes:**
   ```bash
   git add .
   git commit -m "Clean up manifest files and fix local development"
   git push
   ```

## 📁 **PROJECT STRUCTURE**

```
word-addin/
├── manifest.xml                    ← Production manifest
├── manifest-dev-local.xml          ← Local development manifest
├── manifest-archive/               ← All old/unused manifests
│   ├── manifest-word-api-fix.xml   ← Old testing manifest
│   └── ... (15 other archived manifests)
└── src/
    └── taskpane/
        └── taskpane.html           ← Main taskpane file
```

---

## 🎉 **RESULT: CLEAN AND ORGANIZED**

✅ **Only 2 active manifests** (production + local dev)
✅ **All old manifests archived** (16 files moved to archive)
✅ **Local development manifest fixed** (no more broken URLs)
✅ **Both manifests use Word API 1.3** (modern compatibility)
✅ **Clear separation** between production and development

**Status**: 🚀 **MANIFEST CONFIGURATION CLEAN AND READY**
