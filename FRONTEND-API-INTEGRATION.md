# Frontend API Integration Guide

## Current Status: Demo Mode ✅

The frontend is currently configured to work in **Demo Mode** using mock data. This allows you to develop and test the UI while the AWS backend is being set up.

## Quick Start

### Demo Mode (Current)
- ✅ **Ready to use** - No setup required
- ✅ **Mock contract generation** - Uses local templates
- ✅ **Mock contract analysis** - Simulated AI responses
- ✅ **Full UI functionality** - All buttons and features work

### API Mode (When AWS is ready)
- 🔄 **Requires backend deployment** - AWS API must be running
- 🔄 **Real AI analysis** - Connects to actual AI providers
- 🔄 **Database integration** - Stores analysis results
- 🔄 **Authentication** - User management and security

## Switching to Real API

### Step 1: Update API Endpoint
When your AWS backend is deployed, update the production URL in `src/config/api-config.js`:

```javascript
production: {
  baseUrl: 'https://your-actual-aws-domain.com/api/v1',  // Update this
  timeout: 30000,
  description: 'AWS production server'
}
```

### Step 2: Enable API Mode
In the Word add-in interface:
1. Open the **Configuration** section at the top
2. Toggle **"Use Real API"** switch to ON
3. The status indicator will change from yellow (Demo) to green (API)

### Step 3: Test Connection
The frontend will automatically test the API connection when you switch modes. Check the status message for connection results.

## Configuration Options

### Environment Variables
- `NODE_ENV=production` - Uses production API endpoint
- `NODE_ENV=development` - Uses local development endpoint

### Feature Flags (in taskpane.js)
```javascript
API_CONFIG = {
  USE_REAL_API: false,  // Set to true for real API
  baseUrl: '...',       // Automatically set based on environment
  timeout: 30000
}
```

## API Endpoints

The frontend expects these backend endpoints:

### Contract Generation
- `POST /api/v1/contracts/generate`
- Body: `{ agreement_type, content_type, fields: {...} }`
- Response: `{ contract_text, metadata }`

### Contract Analysis
- `POST /api/v1/contracts/analyze`
- Body: `{ document_text, analysis_type }`
- Response: `{ contract_type, compliance_score, summary, risks, key_terms, recommendations }`

### Health Check
- `GET /api/v1/health`
- Response: `{ status, timestamp }`

## Development Workflow

### Current (Demo Mode)
1. ✅ Develop UI features
2. ✅ Test user interactions
3. ✅ Refine contract templates
4. ✅ Perfect analysis display

### When API is Ready
1. 🔄 Update API endpoint
2. 🔄 Enable API mode
3. 🔄 Test real AI integration
4. 🔄 Add authentication
5. 🔄 Deploy to production

## Troubleshooting

### Demo Mode Issues
- Check browser console for JavaScript errors
- Verify Office.js is loaded
- Ensure Word document is open

### API Mode Issues
- Check API endpoint URL is correct
- Verify backend is running and accessible
- Check network connectivity
- Review browser console for API errors

## Next Steps

1. **Continue frontend development** in Demo Mode
2. **Set up AWS infrastructure** (separate process)
3. **Deploy backend API** to AWS
4. **Update configuration** with real API endpoint
5. **Switch to API mode** and test integration
6. **Add authentication** and user management
7. **Deploy to production**

## Files Modified for API Integration

- `src/taskpane/taskpane.js` - Added API service layer and configuration
- `src/taskpane/taskpane.html` - Added configuration UI
- `src/taskpane/taskpane.css` - Added configuration styling
- `src/config/api-config.js` - Centralized API configuration
- `FRONTEND-API-INTEGRATION.md` - This documentation

The frontend is now **ready for both demo and production use**! 🚀
