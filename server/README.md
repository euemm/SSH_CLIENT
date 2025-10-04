# WebSocket-to-SSH Proxy Server

This server acts as a bridge between your browser-based SSH client and actual SSH servers.

## Why Do You Need This?

Browsers cannot make direct SSH connections because:
- SSH uses TCP sockets which browsers don't support
- Security restrictions prevent raw network access from JavaScript
- You need a server-side component to handle the SSH protocol

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will run on `ws://localhost:8080/ssh`

## How It Works

1. Your browser client connects via WebSocket to this server
2. This server makes actual SSH connections to target servers
3. Data is forwarded between WebSocket (browser) and SSH (target server)

```
Browser (WebSocket) <---> This Server <---> SSH Server
```

## Security Considerations

**IMPORTANT**: This is a basic implementation for development/testing.

For production, you should:
- Add authentication (validate who can use your proxy)
- Add rate limiting
- Whitelist allowed SSH hosts
- Use TLS/SSL (wss:// instead of ws://)
- Add logging and monitoring
- Consider connection timeouts
- Sanitize inputs
- Implement proper error handling
- Add session management

