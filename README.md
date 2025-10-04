# EUEM SSH Client

A modern, mobile-optimized SSH client that runs in your web browser.

## Architecture Overview

```
┌─────────────────┐      WebSocket       ┌──────────────┐      SSH       ┌──────────────┐
│  Browser Client │ <──────────────────> │ Proxy Server │ <────────────> │  SSH Server  │
│   (React App)   │                      │  (Node.js)   │                │   (Target)   │
└─────────────────┘                      └──────────────┘                └──────────────┘
```

### Why This Architecture?

- **Browsers cannot make direct SSH connections** - SSH uses TCP sockets which aren't available in browsers
- **WebSockets are browser-compatible** - But someone needs to bridge WebSocket to SSH
- **A proxy server is required** - To translate between WebSocket and SSH protocols

## Running the Application

To use this SSH client, you need to run both the client and the WebSocket proxy server:

### Step 1: Start the WebSocket Proxy Server
```bash
cd server
npm install
npm start
```

### Step 2: Start the Client
```bash
npm run dev
```

### Step 3: Connect

1. Open http://localhost:5173
2. Enter your SSH server details (host, port, username, password/key)
3. Click "Connect"

The client will connect through the proxy server to your SSH target.

## Project Structure

```
EUEM_SSH_CLIENT/
├── src/                      # React client application
│   ├── components/          # UI components
│   │   ├── ConnectionForm.tsx
│   │   └── TerminalView.tsx
│   ├── services/           # Business logic
│   │   └── SSHClient.ts    # WebSocket client & demo mode
│   └── types/              # TypeScript definitions
│       └── ssh.ts
├── server/                  # WebSocket-to-SSH proxy server
│   ├── server.js           # Node.js server implementation
│   ├── package.json        # Server dependencies
│   └── README.md           # Server documentation
└── package.json            # Client dependencies
```

## Features

- Modern, responsive UI optimized for mobile devices
- Full terminal emulation using xterm.js
- Password and private key authentication
- Mobile keyboard helpers for common commands
- Comprehensive console logging for debugging
- WebSocket-to-SSH proxy server included

## Development

### Client Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Server Development
```bash
cd server
npm run dev          # Start with auto-reload
npm start            # Start production mode
```

## Security Considerations

**IMPORTANT**: The included server is for development/testing only!

For production, you must:
- Add authentication to the WebSocket server
- Implement rate limiting
- Whitelist allowed SSH destinations
- Use TLS/SSL (wss:// instead of ws://)
- Add proper logging and monitoring
- Validate and sanitize all inputs
- Implement connection timeouts
- Consider using a more robust solution

## Alternative Architectures

Instead of this WebSocket proxy approach, you could:

1. **SSH Gateway Services**: Use managed SSH gateway services
2. **Terminal as a Service**: Services like GoTTY, ttyd, or Wetty
3. **Cloud Shell**: Use cloud provider's built-in web shells
4. **SSH Bastion Host**: Deploy your proxy server as a bastion host

## Troubleshooting

### "Can't establish connection to server at ws://localhost:8080/ssh"
- The proxy server is not running
- Start the server with: `cd server && npm start`
- Ensure nothing else is using port 8080

### "can't access property 'dimensions', this._renderer.value is undefined"
- This was caused by React StrictMode
- The app now has StrictMode disabled to prevent this
- All terminal operations are wrapped in error handlers

### Terminal not displaying
- Check browser console for errors
- Ensure xterm.js loaded correctly
- Try refreshing the page

## Console Logging

The app includes comprehensive console logging prefixed by component:
- `[App]` - Main application events
- `[ConnectionForm]` - Form submission and validation
- `[TerminalView]` - Terminal lifecycle and operations
- `[SSHClient]` - WebSocket connection and SSH communication

Open your browser's DevTools to see detailed logs of what's happening.

## Technologies Used

- **React** - UI framework
- **TypeScript** - Type safety
- **xterm.js** - Terminal emulation
- **styled-components** - CSS-in-JS styling
- **WebSocket** - Real-time communication
- **Node.js + ws + ssh2** - Proxy server (optional)

## License

This project is for educational and development purposes.

