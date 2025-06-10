# Fix: "Document Helper" Instead of "RHEI AI Legal Assistant"

## 🔍 **Problem**
You're seeing "Document Helper" instead of "RHEI AI Legal Assistant" when loading the add-in. This indicates you're loading an old cached version or wrong manifest file.

## 🛠️ **Solution Steps**

### **Step 1: Remove the Old Add-in**

1. **In Word Online:**
   - Go to **Insert** > **Add-ins** > **My Add-ins**
   - Find "Document Helper" 
   - Click the **"..."** menu next to it
   - Select **"Remove"** or **"Uninstall"**

2. **In Office 365 Admin Center (if you used that method):**
   - Go to [admin.microsoft.com](https://admin.microsoft.com)
   - Navigate to **Settings** > **Integrated apps**
   - Find "Document Helper" or any old add-in
   - Click **"..."** and select **"Delete"**

### **Step 2: Clear Browser Cache**

1. **Clear cache:**
   - Press **Ctrl+Shift+Delete** (Windows) or **Cmd+Shift+Delete** (Mac)
   - Select "Last hour" or "Last 24 hours"
   - Make sure "Cached images and files" is checked
   - Click **"Clear data"**

2. **Alternative: Use Incognito/Private Mode**
   - Open a new incognito/private browsing window
   - Go to [office.com](https://office.com)
   - This bypasses all cache issues

### **Step 3: Upload Fresh Manifest**

**Option A: Use the Updated Main Manifest**
- Download and use the updated `manifest.xml` (version 1.0.2.0)
- This has a new GUID: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

**Option B: Use the Fresh Manifest (Recommended)**
- Use `manifest-fresh.xml` (version 1.0.3.0)
- This has a completely new GUID: `f9e8d7c6-b5a4-3210-9876-543210fedcba`
- Guaranteed to avoid any caching issues

### **Step 4: Upload Process**

**Method 1: Direct Upload in Word Online**
1. Open Word Online in incognito/private mode
2. Create or open a document
3. Go to **Insert** > **Add-ins** > **Upload My Add-in**
4. Upload `manifest-fresh.xml`
5. Look for "RHEI AI Legal Assistant" in the ribbon

**Method 2: Office 365 Admin Center**
1. Go to [admin.microsoft.com](https://admin.microsoft.com)
2. **Settings** > **Integrated apps** > **Upload custom apps**
3. Upload `manifest-fresh.xml`
4. Deploy to users
5. Users can access via **Insert** > **Add-ins** > **My Add-ins**

## 🎯 **What You Should See**

### **Correct Add-in Name:**
- **Display Name:** "RHEI AI Legal Assistant"
- **Ribbon Group:** "RHEI AI" 
- **Button:** "Show Taskpane"

### **In the Ribbon:**
- Look in the **Home** tab
- Find the **"RHEI AI"** group
- Click **"Show Taskpane"** button

### **In the Taskpane:**
- Header should say "RHEI AI Legal Assistant"
- Status should show initialization progress
- No immediate errors or crashes

## 🐛 **If You Still See "Document Helper"**

This means there's still caching happening. Try these additional steps:

1. **Complete Browser Reset:**
   - Close all browser windows
   - Clear all browsing data (not just cache)
   - Restart browser
   - Try again in incognito mode

2. **Try Different Browser:**
   - Use Chrome, Edge, or Firefox
   - Some browsers cache Office add-ins differently

3. **Wait for Cache Expiration:**
   - Office 365 can cache manifests for up to 24 hours
   - Try again tomorrow if other methods don't work

4. **Use Different Computer/Network:**
   - Try from a different device
   - This confirms if it's a local caching issue

## 🚀 **Expected Behavior After Fix**

Once you upload the correct manifest:

1. **Add-in appears as "RHEI AI Legal Assistant"**
2. **No immediate errors when loading**
3. **Status shows initialization progress**
4. **Either full mode or demo mode works**
5. **Analyze Contract button should be functional**

## 📁 **Files to Use**

- **Primary:** `manifest-fresh.xml` (completely new GUID)
- **Alternative:** `manifest.xml` (updated version)
- **Fallback:** `manifest-word-online-compatible.xml` (minimal requirements)

The fresh manifest should completely resolve the naming issue and ensure you're loading the latest version with all the error fixes!
