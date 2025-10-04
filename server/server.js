import { WebSocketServer } from 'ws';
import { Client as SSHClient } from 'ssh2';

const PORT = 8080;

const wss = new WebSocketServer({ port: PORT });

console.log(`Universal WebSocket proxy server running on ws://localhost:${PORT}`);
console.log(`Supports: SSH, WebRTC, and custom protocols`);

wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');
  
  let sshClient = null;
  let sshStream = null;
  let connectionType = null;

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('Received message:', message.type);

      switch (message.type) {
        case 'connect':
          connectionType = message.protocol || 'ssh';
          console.log(`Establishing ${connectionType.toUpperCase()} connection`);
          
          if (connectionType === 'ssh') {
            await handleSSHConnect(ws, message.config);
          } else if (connectionType === 'webrtc') {
            await handleWebRTCConnect(ws, message.config);
          } else {
            await handleCustomProtocol(ws, message.config, connectionType);
          }
          break;

        case 'data':
          if (connectionType === 'ssh' && sshStream) {
            sshStream.write(message.data);
          } else if (connectionType === 'webrtc') {
            await handleWebRTCData(ws, message.data);
          } else {
            await handleCustomData(ws, message.data, connectionType);
          }
          break;

        case 'disconnect':
          if (connectionType === 'ssh' && sshClient) {
            sshClient.end();
          } else if (connectionType === 'webrtc') {
            await handleWebRTCDisconnect(ws);
          } else {
            await handleCustomDisconnect(ws, connectionType);
          }
          break;

        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        error: error.message
      }));
    }
  });

  async function handleSSHConnect(ws, config) {
    console.log('Connecting to SSH server:', config.host);
    
    sshClient = new SSHClient();

    sshClient.on('ready', () => {
      console.log('SSH connection established');
      
      sshClient.shell((err, stream) => {
        if (err) {
          console.error('Shell error:', err);
          ws.send(JSON.stringify({
            type: 'error',
            error: err.message
          }));
          return;
        }

        sshStream = stream;

        // Send connection success
        ws.send(JSON.stringify({
          type: 'connected'
        }));

        // Forward SSH output to WebSocket
        stream.on('data', (data) => {
          ws.send(JSON.stringify({
            type: 'data',
            data: data.toString('utf-8')
          }));
        });

        stream.on('close', () => {
          console.log('SSH stream closed');
          ws.send(JSON.stringify({
            type: 'closed'
          }));
          sshClient.end();
        });

        stream.stderr.on('data', (data) => {
          console.error('SSH stderr:', data.toString());
        });
      });
    });

    sshClient.on('error', (err) => {
      console.error('SSH connection error:', err);
      ws.send(JSON.stringify({
        type: 'error',
        error: err.message
      }));
    });

    sshClient.on('close', () => {
      console.log('SSH connection closed');
    });

    // Connect to SSH server
    const connectionConfig = {
      host: config.host,
      port: config.port || 22,
      username: config.username,
    };

    // Add authentication method
    if (config.authMethod === 'password') {
      connectionConfig.password = config.password;
    } else if (config.authMethod === 'key') {
      connectionConfig.privateKey = config.privateKey;
    }

    try {
      sshClient.connect(connectionConfig);
    } catch (error) {
      console.error('Failed to connect:', error);
      ws.send(JSON.stringify({
        type: 'error',
        error: error.message
      }));
    }
  }

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    if (connectionType === 'ssh' && sshClient) {
      sshClient.end();
    } else if (connectionType === 'webrtc') {
      handleWebRTCDisconnect(ws);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
  // WebRTC Connection Handler
  async function handleWebRTCConnect(ws, config) {
    console.log('Setting up WebRTC connection:', config);
    
    try {
      // Send WebRTC offer/answer signaling
      ws.send(JSON.stringify({
        type: 'webrtc_ready',
        config: {
          iceServers: config.iceServers || [
            { urls: 'stun:stun.l.google.com:19302' }
          ],
          sdpSemantics: 'unified-plan'
        }
      }));
    } catch (error) {
      console.error('WebRTC setup error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        error: error.message
      }));
    }
  }

  async function handleWebRTCData(ws, data) {
    try {
      // Forward WebRTC signaling data
      ws.send(JSON.stringify({
        type: 'webrtc_data',
        data: data
      }));
    } catch (error) {
      console.error('WebRTC data error:', error);
    }
  }

  async function handleWebRTCDisconnect(ws) {
    console.log('WebRTC connection closed');
    ws.send(JSON.stringify({
      type: 'webrtc_closed'
    }));
  }

  // Custom Protocol Handler
  async function handleCustomProtocol(ws, config, protocol) {
    console.log(`Setting up custom protocol: ${protocol}`, config);
    
    try {
      ws.send(JSON.stringify({
        type: 'custom_ready',
        protocol: protocol,
        config: config
      }));
    } catch (error) {
      console.error(`Custom protocol ${protocol} setup error:`, error);
      ws.send(JSON.stringify({
        type: 'error',
        error: error.message
      }));
    }
  }

  async function handleCustomData(ws, data, protocol) {
    try {
      // Forward custom protocol data
      ws.send(JSON.stringify({
        type: 'custom_data',
        protocol: protocol,
        data: data
      }));
    } catch (error) {
      console.error(`Custom protocol ${protocol} data error:`, error);
    }
  }

  async function handleCustomDisconnect(ws, protocol) {
    console.log(`Custom protocol ${protocol} connection closed`);
    ws.send(JSON.stringify({
      type: 'custom_closed',
      protocol: protocol
    }));
  }
});

wss.on('error', (error) => {
  console.error('WebSocket server error:', error);
});

