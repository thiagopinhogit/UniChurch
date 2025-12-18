#!/usr/bin/env node

/**
 * Script to update mobile API config with current IP
 * Run this after starting the backend to sync the IP
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  // Priority order: Wi-Fi > Ethernet > other
  const priorities = ['Wi-Fi', 'en0', 'Ethernet', 'eth0'];
  
  for (const priority of priorities) {
    if (interfaces[priority]) {
      for (const iface of interfaces[priority]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  }
  
  // Fallback
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return 'localhost';
}

function updateMobileConfig() {
  const localIP = getLocalIP();
  const port = process.env.PORT || 3000;
  const apiUrl = `http://${localIP}:${port}/api`;
  
  const configPath = path.join(__dirname, '../../../mobile/src/config/api.js');
  
  const configContent = `// API base URL - Auto-updated by backend
export const API_BASE_URL = '${apiUrl}';

// For production, update with your backend URL
// export const API_BASE_URL = 'https://your-backend-url.com/api';

// Last updated: ${new Date().toLocaleString()}
`;

  try {
    fs.writeFileSync(configPath, configContent, 'utf8');
    console.log(`✅ Mobile API config updated: ${apiUrl}`);
  } catch (error) {
    console.error('⚠️  Could not auto-update mobile config:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  updateMobileConfig();
}

module.exports = { updateMobileConfig };

