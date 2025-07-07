const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Serve playbooks directory
app.use('/playbooks', express.static(path.join(__dirname, 'playbooks')));

// Serve assets
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve src directory for modular files
app.use('/src', express.static(path.join(__dirname, 'src')));

// Serve all HTML files in root directory
app.use('/taskpane-fixed.html', express.static(path.join(__dirname, 'taskpane-fixed.html')));
app.use('/taskpane-minimal.html', express.static(path.join(__dirname, 'taskpane-minimal.html')));
app.use('/taskpane-debug.html', express.static(path.join(__dirname, 'taskpane-debug.html')));
app.use('/taskpane-ultra-minimal.html', express.static(path.join(__dirname, 'taskpane-ultra-minimal.html')));
app.use('/taskpane-modular.html', express.static(path.join(__dirname, 'taskpane-modular.html')));
app.use('/test-clause-replacement.html', express.static(path.join(__dirname, 'test-clause-replacement.html')));

// Serve test files
app.use('/test-playbooks.html', express.static(path.join(__dirname, 'test-playbooks.html')));
app.use('/debug-contract.html', express.static(path.join(__dirname, 'debug-contract.html')));
app.use('/debug-tsv-parsing.html', express.static(path.join(__dirname, 'debug-tsv-parsing.html')));

// Serve debug files
app.use('/debug-contract-generation.js', express.static(path.join(__dirname, 'debug-contract-generation.js')));
app.use('/simple-contract-test.js', express.static(path.join(__dirname, 'simple-contract-test.js')));

// Serve manifest files
app.use('/manifest-localhost.xml', express.static(path.join(__dirname, 'manifest-localhost.xml')));
app.use('/manifest.xml', express.static(path.join(__dirname, 'manifest.xml')));

// Default route to serve taskpane-fixed.html (simplified version)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'taskpane-fixed.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    playbooks: {
      'content-management': fs.existsSync(path.join(__dirname, 'playbooks', 'content-management')),
      'data-pro': fs.existsSync(path.join(__dirname, 'playbooks', 'data-pro'))
    }
  });
});

// Check if we have HTTPS certificates
const certPath = path.join(process.env.HOME || process.env.USERPROFILE, '.office-addin-dev-certs');
const keyPath = path.join(certPath, 'localhost.key');
const certFilePath = path.join(certPath, 'localhost.crt');

if (fs.existsSync(keyPath) && fs.existsSync(certFilePath)) {
  // Use HTTPS if certificates exist
  const options = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certFilePath)
  };
  
  https.createServer(options, app).listen(PORT, () => {
    console.log(`🚀 HTTPS Server running at https://localhost:${PORT}`);
    console.log(`📋 Manifest URL: https://localhost:${PORT}/manifest-localhost.xml`);
    console.log(`🧪 Test Playbooks: https://localhost:${PORT}/test-playbooks.html`);
    console.log(`🔍 Debug Contract: https://localhost:${PORT}/debug-contract.html`);
    console.log(`💚 Health Check: https://localhost:${PORT}/health`);
    console.log('');
    console.log('📝 To test in Word Online:');
    console.log('1. Go to https://office.com and open Word Online');
    console.log('2. Click Insert > Add-ins > Upload My Add-in');
    console.log('3. Upload the manifest-localhost.xml file');
    console.log('4. The add-in should appear in the taskpane');
  });
} else {
  // Fall back to HTTP
  app.listen(PORT, () => {
    console.log(`🚀 HTTP Server running at http://localhost:${PORT}`);
    console.log(`⚠️  Note: Word Online requires HTTPS. You may need to install certificates.`);
    console.log(`📋 Manifest URL: http://localhost:${PORT}/manifest-localhost.xml`);
    console.log(`🧪 Test Playbooks: http://localhost:${PORT}/test-playbooks.html`);
    console.log(`💚 Health Check: http://localhost:${PORT}/health`);
    console.log('');
    console.log('To install HTTPS certificates, run: npm run start');
  });
}

// Also start HTTP server on port 3001 for testing
const httpApp = express();
httpApp.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Copy all the same routes for HTTP
httpApp.use(express.static(path.join(__dirname, 'dist')));
httpApp.use('/playbooks', express.static(path.join(__dirname, 'playbooks')));
httpApp.use('/assets', express.static(path.join(__dirname, 'assets')));
httpApp.use('/src', express.static(path.join(__dirname, 'src')));
httpApp.use('/taskpane-fixed.html', express.static(path.join(__dirname, 'taskpane-fixed.html')));
httpApp.use('/taskpane-minimal.html', express.static(path.join(__dirname, 'taskpane-minimal.html')));
httpApp.use('/taskpane-debug.html', express.static(path.join(__dirname, 'taskpane-debug.html')));
httpApp.use('/taskpane-ultra-minimal.html', express.static(path.join(__dirname, 'taskpane-ultra-minimal.html')));
httpApp.use('/taskpane-modular.html', express.static(path.join(__dirname, 'taskpane-modular.html')));
httpApp.use('/test-clause-replacement.html', express.static(path.join(__dirname, 'test-clause-replacement.html')));
httpApp.use('/test-playbooks.html', express.static(path.join(__dirname, 'test-playbooks.html')));
httpApp.use('/debug-contract.html', express.static(path.join(__dirname, 'debug-contract.html')));
httpApp.use('/debug-tsv-parsing.html', express.static(path.join(__dirname, 'debug-tsv-parsing.html')));
httpApp.use('/debug-contract-generation.js', express.static(path.join(__dirname, 'debug-contract-generation.js')));
httpApp.use('/simple-contract-test.js', express.static(path.join(__dirname, 'simple-contract-test.js')));
httpApp.use('/manifest-localhost.xml', express.static(path.join(__dirname, 'manifest-localhost.xml')));
httpApp.use('/manifest.xml', express.static(path.join(__dirname, 'manifest.xml')));

httpApp.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'taskpane-modular.html'));
});

httpApp.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    protocol: 'HTTP',
    playbooks: {
      'content-management': fs.existsSync(path.join(__dirname, 'playbooks', 'content-management')),
      'data-pro': fs.existsSync(path.join(__dirname, 'playbooks', 'data-pro'))
    }
  });
});

httpApp.listen(3001, () => {
  console.log(`🌐 HTTP Server also running at http://localhost:3001 (for testing)`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down server...');
  process.exit(0);
});
