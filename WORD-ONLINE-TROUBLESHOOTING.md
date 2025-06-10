# Word Online Manifest Validation Troubleshooting

## 🚨 **CURRENT ISSUE**
Word Online shows "add-in manifest is not valid" when trying to upload any manifest.

## 🔍 **POTENTIAL CAUSES & SOLUTIONS**

### **1. Word API Version Issue (Most Likely)**
**Problem**: Word Online may not support Word API 1.3
**Solution**: Use Word API 1.1 for better compatibility

### **2. Icon Accessibility Issues**
**Problem**: Word Online cannot access or validate icon URLs
**Test**: Check if icons are properly accessible

### **3. XML Validation Issues**
**Problem**: Strict XML validation in Word Online
**Solution**: Use minimal, validated manifest

### **4. GUID Conflicts**
**Problem**: GUID already in use or invalid format
**Solution**: Use production GUID or generate new one

## 📋 **TESTING STRATEGY**

### **Step 1: Test Minimal Manifest**
Try `manifest-word-online-minimal.xml`:
- ✅ Minimal structure
- ✅ Word API 1.1
- ✅ Same GUID as production
- ✅ GitHub Pages URLs

### **Step 2: Test Production Manifest**
Try the main `manifest.xml`:
- Check if Word API 1.3 is the issue
- Verify if full VersionOverrides cause problems

### **Step 3: Test Icon URLs**
Verify all icon URLs are accessible:
- https://mfellsbbtv.github.io/starling-word-addin/assets/icon-16.png
- https://mfellsbbtv.github.io/starling-word-addin/assets/icon-32.png
- https://mfellsbbtv.github.io/starling-word-addin/assets/icon-64.png
- https://mfellsbbtv.github.io/starling-word-addin/assets/icon-80.png

## 🎯 **RECOMMENDED TESTING ORDER**

### **1. First: Try `manifest-word-online-minimal.xml`**
This is the simplest possible manifest that should work:
- Minimal XML structure
- Word API 1.1 (most compatible)
- Production GUID
- Basic taskpane only (no ribbon commands)

### **2. If Minimal Works: Try `manifest.xml`**
Test if the full production manifest works:
- This will tell us if Word API 1.3 is the issue
- Or if VersionOverrides cause problems

### **3. If Neither Works: Icon/URL Issues**
Check if the problem is with resource accessibility:
- Icons not loading properly
- GitHub Pages serving incorrect MIME types
- CORS issues with Word Online

## 🔧 **DEBUGGING STEPS**

### **Check Icon Accessibility**
1. Open each icon URL in browser
2. Verify they load as images (not text)
3. Check file sizes are reasonable

### **Validate XML Structure**
1. Copy manifest content to XML validator
2. Check for any syntax errors
3. Verify all required elements are present

### **Test URL Accessibility**
1. Verify taskpane.html loads properly
2. Check commands.html is accessible
3. Ensure no 404 errors on any resources

## 🚨 **COMMON WORD ONLINE ISSUES**

### **"Manifest is not valid"**
- **Cause 1**: Word API version too high
- **Cause 2**: Icon URLs not accessible
- **Cause 3**: XML syntax errors
- **Cause 4**: GUID format issues

### **"Unable to load add-in"**
- **Cause 1**: Taskpane URL not accessible
- **Cause 2**: CORS issues
- **Cause 3**: Office.js loading problems

### **"Add-in not appearing"**
- **Cause 1**: Manifest uploaded but not activated
- **Cause 2**: Browser cache issues
- **Cause 3**: Word Online session problems

## 📱 **ALTERNATIVE TESTING METHODS**

### **1. Word Desktop Testing**
- Test manifest in Word Desktop first
- Verify it works there before trying Word Online
- Use local server for development testing

### **2. Office 365 Admin Center**
- If you have admin access, try uploading through admin center
- Sometimes works better than direct upload

### **3. AppSource Testing**
- Consider testing through AppSource validation
- Provides detailed error messages

## 🎯 **IMMEDIATE ACTION PLAN**

1. **Try `manifest-word-online-minimal.xml`** first
2. **If that fails**, check icon URLs manually
3. **If icons are OK**, try production `manifest.xml`
4. **If still failing**, we need to investigate Word Online specific requirements

## 📊 **MANIFEST COMPARISON**

| Feature | Minimal | Production | Word Online Compatible |
|---------|---------|------------|----------------------|
| **Word API** | 1.1 | 1.3 | 1.1 preferred |
| **Structure** | Basic | Full | Basic preferred |
| **Ribbon** | No | Yes | May cause issues |
| **Icons** | Basic | Full set | Must be accessible |

---

**Next Step**: Test `manifest-word-online-minimal.xml` in Word Online and report results.
