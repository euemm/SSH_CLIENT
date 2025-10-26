# SSH Client

A modern, web-based SSH client built with Next.js that provides secure terminal access through WebSocket connections. This application features a beautiful liquid-glass UI design, mobile-responsive interface, and real-time SSH terminal emulation using xterm.js.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Development](#development)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview

The SSH Client is a sophisticated web application that enables secure SSH connections through a WebSocket proxy server. It provides a full-featured terminal experience with modern UI/UX design principles, including:

- **Liquid Glass Design**: Modern glassmorphism UI with backdrop filters and smooth animations
- **Mobile Responsive**: Optimized for both desktop and mobile devices with touch-friendly controls
- **Real-time Terminal**: Full xterm.js integration with proper terminal emulation
- **Secure Authentication**: Dual-layer authentication (WebSocket + SSH)
- **Connection Management**: Persistent connection state and automatic reconnection
- **Cross-platform**: Works on any modern web browser

## Features

### Core Functionality
- **SSH Terminal Emulation**: Full-featured terminal with proper escape sequence handling
- **WebSocket Proxy**: Secure connection through WebSocket proxy server
- **Dual Authentication**: Separate authentication for WebSocket and SSH connections
- **Connection Persistence**: Maintains connection state across browser sessions
- **Real-time Data**: Instant terminal output and input handling

### User Interface
- **Liquid Glass Design**: Modern glassmorphism with backdrop filters
- **Dark/Light Mode**: Automatic theme detection with manual override
- **Mobile Optimization**: Touch-friendly interface with virtual keyboard
- **Responsive Layout**: Adapts to all screen sizes
- **Smooth Animations**: CSS transitions and micro-interactions
- **Accessibility**: Proper ARIA labels and keyboard navigation

### Terminal Features
- **xterm.js Integration**: Industry-standard terminal emulation
- **Custom Themes**: Optimized color schemes for dark/light modes
- **Scrollback Buffer**: Configurable terminal history
- **Web Links**: Clickable URLs in terminal output
- **Auto-fit**: Automatic terminal sizing
- **Mobile Keyboard**: Virtual keyboard for mobile devices

### Security Features
- **Secure WebSocket**: Encrypted communication channel
- **Cookie Authentication**: HTTP-based authentication with cookie persistence
- **Input Validation**: Client-side form validation
- **Error Handling**: Comprehensive error management and user feedback

## Requirements

### System Requirements
- **Node.js**: 18.18.0 or higher (Node.js 20 LTS recommended)
- **Package Manager**: npm, yarn, pnpm, or bun
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Server Requirements
- **WebSocket Proxy Server**: Required for SSH connections
- **HTTPS/WSS**: Recommended for production deployments
- **CORS Configuration**: Proper CORS headers for web client

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd SSH_CLIENT
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 3. Environment Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# WebSocket Configuration
WEBSOCKET_ENDPOINT=wss://your-server.com:443
WEBSOCKET_AUTH_ENDPOINT=https://your-server.com:443/auth/login

# Authentication (Optional - can be left empty to use form inputs)
AUTH_USERNAME=your_websocket_username
AUTH_PASSWORD=your_websocket_password
```

### 4. Generate Configuration

The application automatically generates a `public/config.json` file from environment variables:

```bash
npm run generate-config
```

### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `WEBSOCKET_ENDPOINT` | WebSocket server endpoint | `ws://localhost:8080` | Yes |
| `WEBSOCKET_AUTH_ENDPOINT` | HTTP authentication endpoint | `http://localhost:8080/auth/login` | Yes |
| `AUTH_USERNAME` | WebSocket username (optional) | Empty | No |
| `AUTH_PASSWORD` | WebSocket password (optional) | Empty | No |

### Configuration File

The `public/config.json` file is automatically generated and contains:

```json
{
  "websocket": {
    "endpoint": "wss://your-server.com:443",
    "authEndpoint": "https://your-server.com:443/auth/login"
  },
  "auth": {
    "username": "your_username",
    "password": "your_password"
  }
}
```

### Connection Form Fields

The SSH connection form includes the following fields:

- **Host**: SSH server hostname or IP address
- **Username**: SSH username
- **Password**: SSH password
- **WebSocket Username**: Username for WebSocket authentication
- **WebSocket Password**: Password for WebSocket authentication

## Usage

### Basic Connection

1. **Open the Application**: Navigate to the application URL
2. **Fill Connection Form**: Enter SSH server details and WebSocket credentials
3. **Click Connect**: The application will establish both WebSocket and SSH connections
4. **Use Terminal**: Interact with the SSH server through the web terminal

### Mobile Usage

On mobile devices, the application provides:

- **Virtual Keyboard**: Touch-friendly keyboard with common terminal keys
- **Responsive Layout**: Optimized for small screens
- **Touch Navigation**: Swipe and touch gestures
- **Auto-fit Terminal**: Automatic sizing for mobile screens

### Keyboard Shortcuts

- **Tab**: Auto-completion
- **Ctrl+C**: Interrupt current process
- **Esc**: Escape sequence
- **Arrow Keys**: Navigation (available on mobile virtual keyboard)

### Connection Management

- **Persistent State**: Connection details are saved in cookies
- **Auto-reconnect**: Automatic reconnection on network issues
- **Disconnect**: Manual disconnect with cleanup
- **Status Indicators**: Real-time connection status

## Architecture

### Project Structure

```
SSH_CLIENT/
├── app/                    # Next.js app directory
├── src/
│   ├── components/         # React components
│   │   ├── ConnectionForm.tsx
│   │   └── TerminalView.tsx
│   ├── services/          # Business logic
│   │   └── SSHClient.ts
│   ├── types/            # TypeScript definitions
│   │   └── ssh.ts
│   ├── config/           # Configuration
│   │   └── env.ts
│   └── styles/           # CSS styles
├── public/               # Static assets
├── scripts/              # Build scripts
├── tests/                # Test files
└── ecosystem.config.js   # PM2 configuration
```

### Component Architecture

#### ConnectionForm Component
- **Purpose**: Handles SSH connection configuration
- **Features**: Form validation, cookie persistence, state management
- **Styling**: Liquid glass design with responsive layout

#### TerminalView Component
- **Purpose**: Manages terminal display and SSH communication
- **Features**: xterm.js integration, mobile keyboard, connection management
- **Styling**: Terminal-specific styling with backdrop effects

#### SSHClient Service
- **Purpose**: WebSocket communication and SSH protocol handling
- **Features**: Authentication, message handling, connection state management
- **Architecture**: Event-driven with callback system

### Data Flow

1. **User Input**: Connection form captures SSH and WebSocket credentials
2. **Authentication**: HTTP authentication establishes WebSocket session
3. **SSH Connection**: WebSocket proxy establishes SSH connection
4. **Terminal Communication**: Bidirectional data flow between browser and SSH server
5. **State Management**: Connection state maintained across components

## API Documentation

### WebSocket Protocol

The application communicates with the WebSocket proxy server using JSON messages:

#### Authentication Message
```json
{
  "type": "auth",
  "username": "websocket_username",
  "password": "websocket_password"
}
```

#### SSH Connection Message
```json
{
  "type": "connect",
  "config": {
    "host": "ssh_server_host",
    "port": 22,
    "username": "ssh_username",
    "authMethod": "password",
    "password": "ssh_password"
  }
}
```

#### Terminal Data Message
```json
{
  "type": "data",
  "data": "terminal_input_data"
}
```

#### Disconnect Message
```json
{
  "type": "disconnect"
}
```

### Message Types

| Type | Direction | Description |
|------|-----------|-------------|
| `auth` | Client → Server | WebSocket authentication |
| `auth_success` | Server → Client | Authentication successful |
| `connect` | Client → Server | Establish SSH connection |
| `connected` | Server → Client | SSH connection established |
| `data` | Bidirectional | Terminal data |
| `error` | Server → Client | Error message |
| `ping` | Bidirectional | Keep-alive ping |
| `pong` | Bidirectional | Keep-alive response |
| `disconnect` | Client → Server | Close connection |

### HTTP Authentication Endpoint

The application also uses HTTP authentication for cookie-based session management:

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "username": "websocket_username",
  "password": "websocket_password"
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "username": "websocket_username",
    "id": "user_id"
  }
}
```

## Deployment

### Production Build

```bash
npm run build
npm run start
```

### Environment Setup

For production deployment:

1. **Set Environment Variables**:
   ```bash
   export WEBSOCKET_ENDPOINT=wss://your-production-server.com:443
   export WEBSOCKET_AUTH_ENDPOINT=https://your-production-server.com:443/auth/login
   ```

2. **Configure WebSocket Proxy Server**: Ensure your WebSocket proxy server is running and accessible

3. **HTTPS Configuration**: Use HTTPS/WSS for production deployments

### PM2 Deployment

The project includes PM2 configuration for production deployment:

```bash
pm2 start ecosystem.config.js
```

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Nginx Configuration

Example Nginx configuration for reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Development

### Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Run Linting**:
   ```bash
   npm run lint
   ```

### Code Structure

- **TypeScript**: Full TypeScript support with strict type checking
- **Styled Components**: CSS-in-JS styling with theme support
- **React Hooks**: Modern React patterns with hooks
- **Next.js**: App router and server-side rendering

### Styling System

The application uses a custom liquid glass design system:

- **CSS Variables**: Custom properties for theming
- **Backdrop Filters**: Glassmorphism effects
- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: Automatic theme detection

### State Management

- **React State**: Local component state with hooks
- **Cookie Storage**: Persistent connection preferences
- **Event System**: Callback-based communication between components

## Testing

### Test Files

The `tests/` directory contains debugging and testing utilities:

#### client-example.js
Comprehensive WebSocket client example demonstrating:
- HTTP authentication flow
- WebSocket connection handling
- SSH connection establishment
- Message handling and configuration loading

**Usage**:
```bash
node tests/client-example.js
```

#### debug-ws.js / debug-ws.mjs
Simple WebSocket debugging scripts for testing connections:
- WebSocket connectivity testing
- SSH connection request testing
- Message logging and event handling
- Auto-close after 10 seconds

**Usage**:
```bash
node tests/debug-ws.js
# or
node tests/debug-ws.mjs
```

#### test-connection.html
Browser-based WebSocket connection test page:
- Visual status updates
- Real-time logging
- CORS and browser-specific issue debugging

**Usage**:
```bash
# Open in browser
open tests/test-connection.html
# or serve locally
python3 -m http.server 3000
# then navigate to http://localhost:3000/tests/test-connection.html
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test
node tests/client-example.js
```

## Troubleshooting

### Common Issues

#### Connection Failed
**Problem**: "Cannot connect to WebSocket server"

**Solutions**:
1. Verify WebSocket proxy server is running
2. Check `WEBSOCKET_ENDPOINT` configuration
3. Ensure proper CORS headers on server
4. Check network connectivity

#### Authentication Failed
**Problem**: "WebSocket username and password are required"

**Solutions**:
1. Verify WebSocket credentials in form or environment variables
2. Check `WEBSOCKET_AUTH_ENDPOINT` configuration
3. Ensure authentication server is accessible
4. Check cookie settings in browser

#### Terminal Not Displaying
**Problem**: Terminal appears blank or doesn't respond

**Solutions**:
1. Check browser console for JavaScript errors
2. Verify xterm.js is loading correctly
3. Check WebSocket data flow
4. Ensure proper terminal initialization

#### Mobile Issues
**Problem**: Poor mobile experience or keyboard issues

**Solutions**:
1. Clear browser cache
2. Check viewport meta tag
3. Verify touch event handling
4. Test virtual keyboard functionality

### Debug Mode

Enable debug logging by opening browser developer tools and checking the console for detailed logs. All components include comprehensive logging for troubleshooting.

### Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | Fully Supported |
| Firefox | 88+ | Fully Supported |
| Safari | 14+ | Fully Supported |
| Edge | 90+ | Fully Supported |

### Performance Optimization

- **Terminal Buffer**: Configurable scrollback buffer size
- **Memory Management**: Proper cleanup of WebSocket connections
- **Mobile Optimization**: Reduced animations on mobile devices
- **Lazy Loading**: Components loaded on demand

## Contributing

### Development Guidelines

1. **Code Style**: Follow existing TypeScript and React patterns
2. **Testing**: Add tests for new features
3. **Documentation**: Update README for significant changes
4. **Linting**: Ensure code passes ESLint checks

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Follow configured linting rules
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Use conventional commit messages

### Feature Requests

Please use GitHub issues to request new features. Include:
- Detailed description of the feature
- Use case and benefits
- Implementation suggestions if applicable

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support

For support and questions:

1. **GitHub Issues**: Report bugs and request features
2. **Documentation**: Check this README and code comments
3. **Community**: Join discussions in GitHub discussions

## Changelog

### Version 0.1.0
- Initial release
- WebSocket-based SSH client
- Liquid glass UI design
- Mobile responsive interface
- xterm.js terminal emulation
- Dual authentication system
- Connection persistence
- Comprehensive error handling

---

**Note**: This SSH client requires a compatible WebSocket proxy server to function. Ensure your server implementation supports the documented WebSocket protocol and authentication flow.