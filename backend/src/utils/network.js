const os = require('os');

/**
 * Get local network IP address
 * @returns {string} Local IP address
 */
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  // Priority order: Wi-Fi > Ethernet > other
  const priorities = ['Wi-Fi', 'en0', 'Ethernet', 'eth0'];
  
  for (const priority of priorities) {
    if (interfaces[priority]) {
      for (const iface of interfaces[priority]) {
        // Skip internal (127.0.0.1) and non-IPv4 addresses
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  }
  
  // Fallback: search all interfaces
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return 'localhost';
}

/**
 * Kill process on port (cross-platform)
 * @param {number} port - Port number
 */
async function killProcessOnPort(port) {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);
  
  try {
    if (process.platform === 'win32') {
      // Windows
      const { stdout } = await execPromise(`netstat -ano | findstr :${port}`);
      const lines = stdout.split('\n');
      const pids = new Set();
      
      for (const line of lines) {
        const match = line.match(/LISTENING\s+(\d+)/);
        if (match) {
          pids.add(match[1]);
        }
      }
      
      for (const pid of pids) {
        try {
          await execPromise(`taskkill /F /PID ${pid}`);
          console.log(`🔪 Killed process ${pid} on port ${port}`);
        } catch (err) {
          // Process might have already died
        }
      }
    } else {
      // macOS/Linux
      try {
        await execPromise(`lsof -ti:${port} | xargs kill -9 2>/dev/null`);
        console.log(`🔪 Killed process on port ${port}`);
      } catch (err) {
        // No process was using the port
      }
    }
  } catch (error) {
    // Port was not in use
  }
}

module.exports = {
  getLocalIP,
  killProcessOnPort
};

