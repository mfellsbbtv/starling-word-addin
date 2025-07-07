# 🧪 Local Testing Guide for RHEI Word Add-in

## 🚀 Quick Start

Your local development environment is now set up and running! Here's how to test the Word Add-in with the new playbooks.

### ✅ Current Status
- ✅ Local HTTPS server running on `https://localhost:3000`
- ✅ Both Content Management and Data Pro playbooks loaded
- ✅ Manifest validated and ready for Word Online
- ✅ All JSON files validated and accessible

## 📋 Step-by-Step Testing Instructions

### 1. Verify Local Server is Running

The server should already be running. If not, start it with:
```bash
npm run local-server
```

You should see:
```
🚀 HTTPS Server running at https://localhost:3000
📋 Manifest URL: https://localhost:3000/manifest-localhost.xml
🧪 Test Playbooks: https://localhost:3000/test-playbooks.html
💚 Health Check: https://localhost:3000/health
```

### 2. Test Playbooks in Browser

Open the test page: https://localhost:3000/test-playbooks.html

Click the test buttons to verify:
- ✅ Content Management Playbook loads correctly
- ✅ Data Pro Playbook loads correctly
- ✅ All JSON files are accessible

### 3. Load Add-in in Word Online

1. **Open Word Online**
   - Go to https://office.com
   - Sign in with your Microsoft account
   - Click "Word" to create a new document

2. **Upload the Add-in**
   - In Word Online, click **Insert** → **Add-ins**
   - Click **Upload My Add-in**
   - Upload the file: `manifest-localhost.xml` (from your project root)
   - Click **Upload**

3. **Verify Add-in Loads**
   - The add-in should appear in the taskpane on the right
   - You should see "RHEI AI Legal Assistant (Local Dev)" in the title
   - The interface should load with the contract generation options

### 4. Test New Playbook Features

#### Test Content Management Playbook
1. In the add-in taskpane:
   - Select **Agreement Type**: "Content Management"
   - Select **Content Type**: "Music"
   - Click **Generate Contract**
   - Verify the contract generates with real legal clauses

#### Test Data Pro Playbook (NEW!)
1. In the add-in taskpane:
   - Select **Agreement Type**: "Data License Agreement"
   - Select **Content Type**: "General"
   - Click **Generate Contract**
   - Verify the Data License Agreement generates with AI/ML licensing terms

### 5. Test Contract Analysis Features

1. **Generate a sample contract** using either playbook
2. **Click "Analyze Contract"** to test the analysis features
3. **Verify the analysis shows**:
   - Numbered articles and clauses (1.1, 1.2, 2.1, etc.)
   - Risk assessments
   - Suggested changes
   - Individual "Apply Change" buttons

## 🔧 Available Endpoints

### Main Application
- **Add-in Interface**: https://localhost:3000/taskpane.html
- **Manifest File**: https://localhost:3000/manifest-localhost.xml

### Testing & Debugging
- **Playbook Test Page**: https://localhost:3000/test-playbooks.html
- **🔍 Contract Debug Tool**: https://localhost:3000/debug-contract.html
- **Health Check**: https://localhost:3000/health
- **Server Status**: Check terminal output

### Playbook Data (JSON APIs)
- **Content Management Clauses**: https://localhost:3000/playbooks/content-management/music/clauses.json
- **Content Management Template**: https://localhost:3000/playbooks/content-management/music/template.json
- **Data Pro Clauses**: https://localhost:3000/playbooks/data-pro/general/clauses.json
- **Data Pro Template**: https://localhost:3000/playbooks/data-pro/general/template.json

## 🐛 Troubleshooting

### 🚨 Contract Generation Not Working
**🔍 Use the Debug Tool**: https://localhost:3000/debug-contract.html

This comprehensive debug tool will help you identify exactly where the issue is:
1. **Check Word API Status** - Verifies if Word API is available
2. **Test Simple Contract** - Bypasses complex logic for direct testing
3. **Step-by-Step Debugging** - Identifies exactly where the failure occurs
4. **Console Output** - Shows detailed error messages

**Quick Fix**: Try the "Test Simple Contract" button in the debug tool - this often works even when the main generate button doesn't.

### Add-in Won't Load in Word Online
1. **Check HTTPS Certificate**: Browser may show security warning - click "Advanced" → "Proceed to localhost"
2. **Clear Browser Cache**: Hard refresh (Ctrl+Shift+R) or clear cache
3. **Check Server Status**: Ensure `npm run local-server` is still running
4. **Verify Manifest**: Run `npm run validate-local` to check manifest

### Playbooks Not Loading
1. **Check Health Endpoint**: Visit https://localhost:3000/health
2. **Verify JSON Files**: Check browser console for 404 errors
3. **Rebuild Project**: Stop server, run `npm run local-server` again

### Word API Issues
1. **Use Debug Tool**: https://localhost:3000/debug-contract.html
2. **Check Console**: Open browser developer tools (F12) and check console for errors
3. **Try Simple Test**: Use the "Test Simple Contract" button in debug tool
4. **Verify Environment**: Make sure you're actually in Word Online, not just a browser tab

### CORS Issues
1. **Server Configuration**: The local server includes CORS headers
2. **Browser Security**: Some browsers may block localhost HTTPS
3. **Alternative**: Try different browser (Chrome, Edge, Firefox)

## 📊 What's New in This Version

### ✨ New Features
- **Data Pro Playbook**: Complete AI/ML data licensing agreement support
- **Real Legal Content**: Content Management playbook now uses actual RHEI legal matrix data
- **Enhanced Clause Structure**: Proper article/clause numbering (1.1, 1.2, 2.1, etc.)
- **Risk Assessment**: Comprehensive risk rules for both playbook types
- **Form Fields**: Dynamic form generation for both agreement types

### 🔄 Updated Components
- **PlaybookService**: Now supports data-pro agreement type
- **Contract Generator**: Enhanced with Data Pro form templates
- **UI Components**: Updated to include Data License Agreement option
- **Event Handlers**: Improved document analysis for data licensing terms

## 🎯 Testing Checklist

- [ ] Local server starts successfully
- [ ] Health check returns both playbooks as available
- [ ] Test page loads and shows successful playbook loading
- [ ] Manifest validates without errors
- [ ] Add-in loads in Word Online
- [ ] Content Management playbook generates contracts
- [ ] Data Pro playbook generates data license agreements
- [ ] Contract analysis works with both agreement types
- [ ] All form fields populate correctly
- [ ] Risk assessments display properly

## 🚀 Next Steps

Once local testing is complete, you can:
1. **Deploy to Production**: Update GitHub Pages with new playbooks
2. **Update Production Manifest**: Point to production URLs
3. **Submit to Office Store**: Use the validated manifest for submission
4. **Scale Playbooks**: Add more agreement types and content types

## 💡 Tips for Development

- **Hot Reload**: Server automatically serves updated files after `npm run build:dev`
- **Debug Mode**: Check browser console for JavaScript errors
- **Network Tab**: Monitor API calls to playbook endpoints
- **Manifest Changes**: Restart server after manifest modifications
- **JSON Validation**: Use `python3 -m json.tool filename.json` to validate JSON files

---

**Happy Testing! 🎉**

Your local development environment is now fully configured with both Content Management and Data Pro playbooks ready for testing in Word Online.
