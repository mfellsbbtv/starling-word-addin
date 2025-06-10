# Manifest Upload Troubleshooting Guide

## 🚨 **Problem**
All manifests are failing with "Upload failed. Please check the manifest file and try again."

## 🔍 **Root Causes**
This generic error can be caused by:
1. **XML Schema violations** - Invalid structure or elements
2. **Network/URL issues** - Unreachable URLs in manifest
3. **GUID conflicts** - Duplicate or invalid GUID format
4. **Office 365 restrictions** - Organizational policies blocking uploads
5. **File encoding issues** - Incorrect character encoding

## ✅ **SOLUTION: Try These Manifests in Order**

I've created multiple manifests with different approaches. Try them in this order:

### **1. Absolute Minimal** ⭐ **TRY THIS FIRST**
**File:** `manifest-absolute-minimal.xml`
- **Minimal elements only** - Removes all optional elements
- **Basic structure** - Just the required elements
- **No complex features** - Simplest possible manifest

### **2. Official Microsoft Format**
**File:** `manifest-official-format.xml`
- **Exact Microsoft template** - Based on official documentation
- **Standard GUID** - Uses Microsoft's example GUID format
- **Complete but clean** - All recommended elements

### **3. Ultra Basic**
**File:** `manifest-ultra-basic.xml`
- **No Requirements section** - Removes API requirements
- **No icons** - Removes icon URLs that might be unreachable
- **Bare minimum** - Absolute essentials only

### **4. Minimal Valid**
**File:** `manifest-minimal-valid.xml`
- **Schema compliant** - Follows XML schema exactly
- **Standard elements** - Common manifest structure
- **Clean GUID** - Proper GUID format

## 🔧 **Upload Process for Each**

For each manifest, follow this process:

1. **Clear everything first:**
   - Remove any existing add-ins from Word Online
   - Clear browser cache completely
   - Close and reopen browser

2. **Upload process:**
   - Go to Word Online
   - Insert > Add-ins > Upload My Add-in
   - Select the manifest file
   - Wait for validation

3. **If it fails:**
   - Note the exact error message
   - Try the next manifest in the list

## 🎯 **Expected Results**

### **Success Indicators:**
- ✅ Upload completes without errors
- ✅ Add-in appears in "My Add-ins"
- ✅ Shows "RHEI AI Legal Assistant" name
- ✅ Can be added to Word document

### **If Still Failing:**
- 📝 Note which manifest got furthest
- 📝 Record exact error messages
- 📝 Try different browser (Chrome, Edge, Firefox)

## 🔄 **Alternative Approaches**

### **Option A: Different Upload Method**
Instead of "Upload My Add-in", try:
1. **Office 365 Admin Center** (if you have admin access)
2. **Different Word Online account** (personal vs. work)
3. **Word Desktop** (if available)

### **Option B: Test with Known Working Manifest**
Try uploading a Microsoft sample manifest to test if the upload process itself works:
- Download a sample from Microsoft's GitHub
- Test upload to isolate if it's a manifest issue or system issue

### **Option C: Network/Firewall Issues**
- Try from different network (mobile hotspot)
- Check if corporate firewall blocks manifest validation
- Test from personal device/account

## 📋 **Manifest Priority Order**

1. **`manifest-absolute-minimal.xml`** ← Start here
2. **`manifest-official-format.xml`** ← Microsoft template
3. **`manifest-ultra-basic.xml`** ← No optional elements
4. **`manifest-minimal-valid.xml`** ← Schema compliant

## 🚨 **If All Manifests Fail**

This suggests the issue is not with the manifest content but with:
- **Office 365 organizational restrictions**
- **Network/firewall blocking validation**
- **Browser compatibility issues**
- **Account permissions**

### **Next Steps:**
1. **Try different browser**
2. **Try personal Office 365 account**
3. **Contact IT administrator**
4. **Test from different network**

## 📞 **Getting Help**

If all manifests fail, provide this information:
- Which browser you're using
- Work vs. personal Office 365 account
- Exact error messages for each manifest
- Network environment (corporate vs. home)

The absolute minimal manifest should work if the upload system is functioning properly!
