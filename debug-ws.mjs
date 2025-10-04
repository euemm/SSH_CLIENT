// Simple WebSocket test to debug the connection issue
import WebSocket from 'ws';

console.log('Testing WebSocket connection to ws://localhost:8080/ssh');

const ws = new WebSocket('ws://localhost:8080/ssh');

ws.on('open', () => {
  console.log('✅ WebSocket connection opened');
  
  const payload = {
    type: 'connect',
    config: {
      host: 'localhost',
      port: 22,
      username: 'test',
      authMethod: 'password',
      password: 'test'
    }
  };
  
  console.log('📤 Sending connection request:', JSON.stringify(payload));
  ws.send(JSON.stringify(payload));
});

ws.on('message', (data) => {
  console.log('📥 Received message:', data.toString());
  
  try {
    const message = JSON.parse(data);
    console.log('📥 Parsed message:', message);
    
    if (message.type === 'connected') {
      console.log('✅ SSH connection confirmed by server');
    } else if (message.type === 'data') {
      console.log('📊 Received SSH data:', message.data.substring(0, 100));
    } else if (message.type === 'error') {
      console.log('❌ SSH error:', message.error);
      console.log('✅ WebSocket connection is working - SSH error is expected');
      console.log('✅ This should now be treated as connection established');
    } else {
      console.log('❓ Unknown message type:', message.type);
    }
  } catch (e) {
    console.log('❌ Error parsing message:', e.message);
  }
});

ws.on('close', (code, reason) => {
  console.log('🔴 WebSocket closed:', code, reason.toString());
});

ws.on('error', (error) => {
  console.log('❌ WebSocket error:', error.message);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.log('⏰ Test timeout - closing connection');
  ws.close();
  process.exit(0);
}, 10000);
