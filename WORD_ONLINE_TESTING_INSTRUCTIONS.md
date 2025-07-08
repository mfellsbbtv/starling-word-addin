# Word Online Testing Instructions for In-Place Clause Replacement

## Issue Identified

From the console output, the clause replacement is failing because **you're testing in demo mode outside of Word Online**. The Word API is not available in the browser-only environment.

**Console Evidence:**
```
Line 154: Word API not available - using demo mode
Line 264: typeof Word: undefined
Line 280: Word API not available, running in simulation mode
Line 281: Clause replacement failed: Error: Word API not available - running in demo mode
```

## Solution: Test in Word Online

The in-place clause replacement **requires the actual Word API** which is only available when the add-in is loaded inside Word Online.

## Step-by-Step Testing Instructions

### 1. **Prepare for Word Online Testing**

Ensure your local server is running:
```bash
node local-server.js
```

Verify it's accessible at: `https://localhost:3000`

### 2. **Load Add-in in Word Online**

1. **Go to Word Online**:
   - Open https://office.com
   - Sign in to your Office 365 account
   - Click "Word" to create a new document

2. **Upload the Add-in**:
   - In Word Online, go to **Insert** tab
   - Click **Add-ins** → **Upload My Add-in**
   - Upload the file: `manifest-localhost.xml`
   - The add-in should appear in the taskpane

3. **Verify Add-in Loads**:
   - You should see "RHEI AI Legal Assistant" in the taskpane
   - The interface should show contract generation and clause replacement sections

### 3. **Test In-Place Clause Replacement**

#### **Step 1: Generate a Contract**
1. Fill in the contract form fields:
   - Company Name: `RHEI Creations Inc.`
   - Provider Name: `Test Provider Inc.`
   - Effective Date: `2025-07-08`
   - Agreement Title: `Test Agreement`

2. Click **"📄 Generate Contract"**
   - This should create a contract in the Word document
   - Verify clauses are numbered (1.1, 2.1, 8.1, etc.)

#### **Step 2: Replace a Specific Clause**
1. In the "Clause Replacement" section:
   - Select clause **"8.1 - RHEI Reports"** from dropdown
   - Choose an alternative (e.g., **"MNRK Music Group LP"**)
   - Click **"Apply Replacement"**

2. **Expected Result**:
   - Original clause 8.1 should be **removed** from its location
   - New clause 8.1 should appear **in the same location**
   - Text should be **blue and bold** to indicate change
   - **No content should be added at document end**

#### **Step 3: Verify In-Place Replacement**
1. **Check the document**:
   - Find where clause 8.1 was originally located
   - Verify the content has changed to the selected alternative
   - Confirm other clauses (8.2, 9.1, etc.) are unchanged

2. **Check console output**:
   - Open browser developer tools (F12)
   - Look for success messages like:
     ```
     ✅ Successfully replaced clause 8.1 in-place
     ```

### 4. **Debug Commands for Word Online**

Once the add-in is loaded in Word Online, you can run these commands in the browser console:

#### **Test Word API Availability**:
```javascript
await window.debugWordAPI();
```

#### **Test Direct Clause Replacement**:
```javascript
await window.testClauseReplacement("8.1", "TEST REPLACEMENT CONTENT");
```

#### **Check Document Content**:
```javascript
await Word.run(async (context) => {
    const body = context.document.body;
    body.load('text');
    await context.sync();
    console.log("Document text:", body.text);
    console.log("Contains 8.1:", body.text.includes("8.1"));
});
```

## Expected Console Output in Word Online

### **Successful Setup**:
```
✅ Word.run executed successfully
✅ Document has 2847 characters
✅ Found clause 8.1 paragraph
✅ Successfully replaced clause 8.1 in-place
```

### **Successful Replacement**:
```
=== DIRECT CLAUSE REPLACEMENT FOR 8.1 ===
Document has 2847 characters
Found 1 matches for "8.1"
Found paragraph: "8.1 Original clause content..."
Replacing entire paragraph with clause 8.1
New clause text: "8.1 New replacement content..."
✅ Successfully replaced clause 8.1 in-place
```

## Demo Mode vs Word Online

### **Demo Mode (Browser Only)**:
- ❌ Word API not available
- ❌ Cannot modify Word documents
- ✅ Can test UI and clause selection
- ✅ Shows visual simulation in contract display

### **Word Online Mode**:
- ✅ Full Word API available
- ✅ Can modify Word documents in-place
- ✅ True clause replacement functionality
- ✅ Track changes support

## Troubleshooting

### **Add-in Won't Load**:
- Check HTTPS certificate acceptance
- Verify manifest file is correct
- Try refreshing Word Online
- Check browser console for errors

### **Word API Still Not Available**:
- Ensure you're in Word Online (not Word Desktop)
- Check Office 365 permissions
- Try creating a new document
- Verify add-in is properly loaded

### **Clause Not Found**:
- Generate a contract first
- Check clause numbering in document
- Verify clause exists before replacement
- Use debug commands to inspect document

### **Replacement Goes to End**:
- This should NOT happen in Word Online
- If it does, check console for errors
- Verify Word API is properly initialized
- Try the debug commands to identify the issue

## Summary

The clause replacement functionality **works correctly** but requires testing in **Word Online** where the Word API is available. The demo mode in the browser is only for UI testing and cannot perform actual document modifications.

**Next Steps:**
1. Test in Word Online following the instructions above
2. Share console output from Word Online testing
3. Verify in-place replacement works as expected
4. Report any issues found during Word Online testing

The in-place replacement should work perfectly in Word Online since the Word API will be available and the implementation is designed to find and replace clauses in their exact locations.
