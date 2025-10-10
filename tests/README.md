# Test Files

This directory contains test and debug scripts for the SSH Client application.

## Files

### client-example.js
A comprehensive WebSocket client example that demonstrates:
- HTTP authentication flow
- WebSocket connection handling
- SSH connection establishment
- Message handling (auth, data, ping/pong)
- Configuration loading from `public/config.json`

**Usage:**
```bash
node tests/client-example.js
```

### debug-ws.js / debug-ws.mjs
Simple WebSocket debugging scripts for testing connections to remote servers.
- Tests WebSocket connectivity
- Sends test SSH connection requests
- Logs all messages and events
- Auto-closes after 10 seconds

**Usage:**
```bash
node tests/debug-ws.js
# or
node tests/debug-ws.mjs
```

### test-connection.html
Browser-based WebSocket connection test page.
- Opens in browser to test WebSocket connections
- Visual status updates
- Real-time logging
- Useful for debugging CORS and browser-specific issues

**Usage:**
```bash
# Open in browser
open tests/test-connection.html
# or
python3 -m http.server 3000
# then navigate to http://localhost:3000/tests/test-connection.html
```

## Notes

- These files are for development and debugging only
- They are not part of the production application
- Modify the WebSocket endpoints and credentials as needed for your testing environment

