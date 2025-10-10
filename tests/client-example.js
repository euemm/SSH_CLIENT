import WebSocket from 'ws';
import fs from 'fs';

// Load configuration from config.json
let config;
try {
  const configData = fs.readFileSync('./public/config.json', 'utf8');
  config = JSON.parse(configData);
  console.log('Loaded configuration:', config);
} catch (error) {
  console.error('Error loading config.json, using defaults:', error);
  config = {
    websocket: { endpoint: 'ws://localhost:8080', authEndpoint: 'http://localhost:8080/auth/login' },
    auth: { username: '', password: '' }
  };
}

const ws = new WebSocket(config.websocket.endpoint);

// Authentication credentials from config (you may need to set these manually)
const credentials = {
  username: config.auth.username || 'admin',
  password: config.auth.password || 'admin123'
};

let isAuthenticated = false;

ws.on('open', () => {
  console.log('Connected to WebSocket server');
  
  // Try to authenticate via HTTP first (this will set a cookie)
  authenticateViaHTTP();
});

// Function to authenticate via HTTP and get cookie
async function authenticateViaHTTP() {
  try {
    console.log('Attempting HTTP authentication...');
    
    const response = await fetch(config.websocket.authEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important: include cookies
      body: JSON.stringify(credentials)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('HTTP authentication successful!');
      console.log('User:', result.user);
      
      // Now WebSocket should be automatically authenticated via cookie
      // Wait a moment for the WebSocket to process the cookie
      setTimeout(() => {
        if (!isAuthenticated) {
          console.log('WebSocket not authenticated via cookie, trying manual auth...');
          // Fallback to manual WebSocket authentication
          ws.send(JSON.stringify({
            type: 'auth',
            username: credentials.username,
            password: credentials.password
          }));
        }
      }, 1000);
    } else {
      console.error('HTTP authentication failed:', result.error);
      // Fallback to manual WebSocket authentication
      ws.send(JSON.stringify({
        type: 'auth',
        username: credentials.username,
        password: credentials.password
      }));
    }
  } catch (error) {
    console.error('HTTP authentication error:', error);
    // Fallback to manual WebSocket authentication
    ws.send(JSON.stringify({
      type: 'auth',
      username: credentials.username,
      password: credentials.password
    }));
  }
}

ws.on('message', (data) => {
  const message = JSON.parse(data.toString());
  
  switch (message.type) {
    case 'auth_success':
      console.log('Authentication successful!');
      console.log('Token:', message.token);
      console.log('User:', message.user);
      isAuthenticated = true;
      
      // Now you can perform SSH operations
      // Example: Connect to SSH server
      setTimeout(() => {
        ws.send(JSON.stringify({
          type: 'connect',
          config: {
            host: 'localhost',
            port: 22,
            username: 'testuser',
            authMethod: 'password',
            password: 'testpass'
          }
        }));
      }, 1000);
      break;
      
    case 'connected':
      console.log('SSH connection established');
      
      // Send some data
      ws.send(JSON.stringify({
        type: 'data',
        data: 'ls -la\n'
      }));
      break;
      
    case 'data':
      console.log('SSH output:', message.data);
      break;
      
    case 'error':
      console.error('Error:', message.error);
      break;
      
    case 'ping':
      // Respond to ping
      ws.send(JSON.stringify({ type: 'ping' }));
      break;
      
    case 'pong':
      console.log('Received pong');
      break;
      
    case 'status':
      console.log('Server status:', message.data);
      break;
      
    case 'token_refreshed':
      console.log('Token refreshed:', message.token);
      break;
      
    default:
      console.log('Unknown message type:', message.type, message);
  }
});

ws.on('close', () => {
  console.log('Connection closed');
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

// Send ping every 30 seconds
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'ping' }));
  }
}, 30000);
