# Debugging Clause Replacement Issues

## Problem: Clause Still Being Added at Bottom

The clause replacement is still adding content at the bottom of the document instead of replacing in-place. Let's debug this step by step.

## Debugging Steps

### 1. **Test Word API Functionality**

Open the browser console and run:
```javascript
await window.debugWordAPI();
```

This will:
- Test if Word API is available
- Show document content
- Test clause finding for common clauses (1.1, 2.1, 8.1, 10.1)
- Show which clauses are found and their paragraph content

### 2. **Test Direct Clause Replacement**

Run this in the browser console:
```javascript
await window.testClauseReplacement("8.1", "TEST REPLACEMENT CONTENT");
```

This will:
- Search for clause 8.1 specifically
- Show the paragraph content containing the clause
- Attempt direct replacement
- Log detailed information about what's happening

### 3. **Check Document Structure**

First, generate a contract to ensure clauses exist:
1. Fill in contract details
2. Click "📄 Generate Contract"
3. Verify clauses are created (1.1, 2.1, 8.1, etc.)

Then run:
```javascript
await Word.run(async (context) => {
    const body = context.document.body;
    body.load('text');
    await context.sync();
    console.log("Full document text:", body.text);
});
```

### 4. **Test Specific Clause Finding**

```javascript
await Word.run(async (context) => {
    const body = context.document.body;
    
    // Test searching for 8.1
    const searchResults = body.search("8.1", { matchCase: false });
    context.load(searchResults, 'items');
    await context.sync();
    
    console.log(`Found ${searchResults.items.length} matches for "8.1"`);
    
    if (searchResults.items.length > 0) {
        const match = searchResults.items[0];
        const paragraph = match.paragraph;
        context.load(paragraph, 'text');
        await context.sync();
        
        console.log(`Paragraph text: "${paragraph.text}"`);
        console.log(`Starts with 8.1: ${paragraph.text.trim().startsWith("8.1")}`);
    }
});
```

## Common Issues and Solutions

### **Issue 1: Word API Not Available**
**Symptoms**: Console shows "Word object is undefined"
**Solution**: 
- Ensure you're testing in Word Online (not just browser)
- Verify add-in is properly loaded
- Check Office.js is initialized

### **Issue 2: Clause Not Found**
**Symptoms**: "Found 0 matches for clause number"
**Solution**:
- Generate a contract first to create clauses
- Check clause numbering format in document
- Verify clause actually exists in document

### **Issue 3: Wrong Paragraph Selected**
**Symptoms**: Replacement happens in wrong location
**Solution**:
- Check if multiple clauses have same number
- Verify paragraph starts with correct clause number
- Use more specific search patterns

### **Issue 4: insertText Not Working In-Place**
**Symptoms**: Text appears at document end despite using replace
**Solution**:
- This is the current issue we're debugging
- May be Word API limitation or permission issue
- Try alternative approaches

## Alternative Debugging Approach

If the Word API `insertText` with `replace` location is not working, let's try a different approach:

### **Method 1: Select and Delete, Then Insert**
```javascript
await Word.run(async (context) => {
    const body = context.document.body;
    const searchResults = body.search("8.1", { matchCase: false });
    context.load(searchResults, 'items');
    await context.sync();
    
    if (searchResults.items.length > 0) {
        const match = searchResults.items[0];
        const paragraph = match.paragraph;
        
        // Select the paragraph
        paragraph.select();
        await context.sync();
        
        // Delete selected content
        paragraph.delete();
        await context.sync();
        
        // Insert new content at the same location
        body.insertText("8.1 NEW CONTENT HERE", Word.InsertLocation.start);
        await context.sync();
    }
});
```

### **Method 2: Use Range.insertText with Before/After**
```javascript
await Word.run(async (context) => {
    const body = context.document.body;
    const searchResults = body.search("8.1", { matchCase: false });
    context.load(searchResults, 'items');
    await context.sync();
    
    if (searchResults.items.length > 0) {
        const match = searchResults.items[0];
        const range = match.getRange();
        
        // Insert new content before the match
        range.insertText("8.1 NEW CONTENT HERE\n", Word.InsertLocation.before);
        
        // Delete the original paragraph
        const paragraph = match.paragraph;
        paragraph.delete();
        
        await context.sync();
    }
});
```

## Expected Console Output

### **Successful Replacement**:
```
=== DIRECT CLAUSE REPLACEMENT FOR 8.1 ===
Document has 2847 characters
Found 1 matches for "8.1"
Found paragraph: "8.1 Original clause content here..."
Replacing entire paragraph with clause 8.1
New clause text: "8.1 New replacement content..."
✅ Successfully replaced clause 8.1 in-place
```

### **Failed Replacement**:
```
=== DIRECT CLAUSE REPLACEMENT FOR 8.1 ===
Document has 2847 characters
Found 0 matches for "8.1"
❌ Clause 8.1 not found in document
```

## Troubleshooting Checklist

### ✅ **Before Testing**:
- [ ] Word Online is open and add-in is loaded
- [ ] Contract has been generated with clauses
- [ ] Browser console is open for debugging
- [ ] No authentication/session issues

### ✅ **During Testing**:
- [ ] Run `debugWordAPI()` first to verify setup
- [ ] Check document content with full text dump
- [ ] Test clause finding before attempting replacement
- [ ] Monitor console for detailed error messages

### ✅ **After Testing**:
- [ ] Check if clause was replaced in correct location
- [ ] Verify no content was added at document end
- [ ] Check for any error messages or warnings
- [ ] Test with different clause numbers

## Next Steps

1. **Run the debug functions** in browser console
2. **Share the console output** so we can see exactly what's happening
3. **Try the alternative methods** if standard approach fails
4. **Check Word Online permissions** and document editing capabilities

The goal is to identify exactly why `insertText` with `Word.InsertLocation.replace` is not working as expected and find a reliable alternative approach for true in-place replacement.

## Quick Test Commands

Copy and paste these into browser console one by one:

```javascript
// Test 1: Check Word API
await window.debugWordAPI();

// Test 2: Test direct replacement
await window.testClauseReplacement("8.1");

// Test 3: Check document content
await Word.run(async (context) => {
    const body = context.document.body;
    body.load('text');
    await context.sync();
    console.log("Document length:", body.text.length);
    console.log("Contains 8.1:", body.text.includes("8.1"));
});
```

Run these tests and share the console output to help identify the exact issue.
