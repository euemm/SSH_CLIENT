const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

// Generate config.json from environment variables
const config = {
  websocket: {
    endpoint: process.env.WEBSOCKET_ENDPOINT || 'ws://localhost:8080',
    authEndpoint: process.env.WEBSOCKET_AUTH_ENDPOINT || 'http://localhost:8080/auth/login'
  },
  auth: {
    username: process.env.AUTH_USERNAME || '',
    password: process.env.AUTH_PASSWORD || ''
  }
};

// Write to public/config.json
const configPath = path.join(__dirname, '..', 'public', 'config.json');
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

console.log('Generated config.json from environment variables:');
console.log(JSON.stringify(config, null, 2));
