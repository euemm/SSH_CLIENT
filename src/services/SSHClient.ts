import { ConnectionConfig, SSHClient as ISSHClient } from '../types/ssh'
import { getClientConfig } from '../config/env'

export class SSHClient implements ISSHClient {
  private ws: WebSocket | null = null
  private connected = false
  private connecting = false
  private dataCallbacks: ((data: string) => void)[] = []
  private closeCallbacks: (() => void)[] = []
  private isAuthenticated = false
  private currentConfig: ConnectionConfig | null = null
  private appConfig: any = null

  // Initialize configuration
  private async initializeConfig() {
    if (!this.appConfig) {
      this.appConfig = await getClientConfig()
    }
    return this.appConfig
  }

  async connect(config: ConnectionConfig): Promise<void> {
    // Prevent multiple simultaneous connections
    if (this.connecting || this.connected) {
      console.warn('[SSHClient] Already connecting or connected, ignoring new connection request')
      return Promise.resolve()
    }

    console.log('[SSHClient] Starting connection with config:', {
      host: config.host,
      port: config.port,
      username: config.username,
      authMethod: config.authMethod,
      wsUsername: config.wsUsername,
      wsPassword: config.wsPassword ? '[REDACTED]' : '[EMPTY]'
    })
    
    this.currentConfig = config
    console.log('[SSHClient] Current config set:', this.currentConfig)
    this.connecting = true
    
    return new Promise(async (resolve, reject) => {
      let resolved = false
      
      // Set a connection timeout
      const timeout = setTimeout(() => {
        if (!resolved) {
          console.error('[SSHClient] Connection timeout after 10 seconds')
          safeReject(new Error('Connection timeout - SSH server did not respond'))
        }
      }, 10000)
      
      const safeResolve = () => {
        if (!resolved) {
          resolved = true
          clearTimeout(timeout)
          this.connecting = false
          this.connected = true
          resolve()
        }
      }
      
      const safeReject = (error: Error) => {
        if (!resolved) {
          resolved = true
          clearTimeout(timeout)
          this.connecting = false
          this.connected = false
          reject(error)
        }
      }
      
      try {
        // Clean up any existing connection
        if (this.ws) {
          this.ws.close()
          this.ws = null
        }
        
        // Initialize configuration and create WebSocket connection
        const appConfig = await this.initializeConfig()
        const wsUrl = appConfig.websocket.endpoint
        console.log('[SSHClient] Creating WebSocket connection to:', wsUrl)
        
        this.ws = new WebSocket(wsUrl)
        
        this.ws.onopen = () => {
          console.log('[SSHClient] WebSocket connection opened successfully')
          
          // Try to authenticate via HTTP first (this will set a cookie)
          this.authenticateViaHTTP(safeResolve, safeReject)
        }
        
        this.ws.onmessage = (event) => {
          console.log('[SSHClient] Received WebSocket message:', event.data)
          
          try {
            const message = JSON.parse(event.data)
            console.log('[SSHClient] Parsed message:', message)
            
            this.handleMessage(message, safeResolve, safeReject)
          } catch (parseError) {
            console.error('[SSHClient] Failed to parse message:', parseError)
            console.error('[SSHClient] Raw message:', event.data)
          }
        }
        
        this.ws.onclose = (event) => {
          console.log('[SSHClient] WebSocket connection closed:', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean
          })
          
          this.connected = false
          this.connecting = false
          this.isAuthenticated = false
          this.ws = null
          
          if (!resolved) {
            clearTimeout(timeout)
            const reason = event.reason || 'Connection lost'
            console.log('[SSHClient] WebSocket closed with code:', event.code)
            
            if (event.code === 1006) {
              console.error('[SSHClient] Connection failed - WebSocket server not available')
              safeReject(new Error('Cannot connect to WebSocket server. Please ensure the server is running.'))
            } else {
              console.log('[SSHClient] Rejecting with error for code:', event.code)
              safeReject(new Error(`WebSocket closed: ${reason} (Code: ${event.code})`))
            }
          }
          
          this.closeCallbacks.forEach(callback => callback())
        }
        
        this.ws.onerror = (error) => {
          console.error('[SSHClient] WebSocket error occurred:', error)
        }
        
      } catch (error) {
        console.error('[SSHClient] Exception during connection setup:', error)
        safeReject(error instanceof Error ? error : new Error('Unknown error'))
      }
    })
  }

  // Function to authenticate via HTTP and get cookie
  private async authenticateViaHTTP(safeResolve: () => void, safeReject: (error: Error) => void) {
    let wsCredentials: { username: string; password: string } | null = null
    
    try {
      console.log('[SSHClient] Attempting HTTP authentication...')
      console.log('[SSHClient] Current config:', this.currentConfig)
      
      const appConfig = await this.initializeConfig()
      console.log('[SSHClient] App config:', appConfig)
      
      const credentials = {
        username: this.currentConfig?.wsUsername || appConfig.auth.username,
        password: this.currentConfig?.wsPassword || appConfig.auth.password
      }
      
      console.log('[SSHClient] Using credentials:', {
        username: credentials.username,
        password: credentials.password ? '[REDACTED]' : '[EMPTY]'
      })
      
      if (!credentials.username || !credentials.password) {
        console.error('[SSHClient] WebSocket credentials are missing!', {
          hasUsername: !!credentials.username,
          hasPassword: !!credentials.password,
          currentConfig: this.currentConfig,
          appConfig: appConfig
        })
        safeReject(new Error('WebSocket username and password are required'))
        return
      }

      // Store credentials for reuse in fallback scenarios
      wsCredentials = { ...credentials }
      
      const response = await fetch(appConfig.websocket.authEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: include cookies
        body: JSON.stringify(credentials)
      })
      
      const result = await response.json()
      
      if (result.success) {
        console.log('[SSHClient] HTTP authentication successful!')
        console.log('[SSHClient] User:', result.user)
        
        // Now WebSocket should be automatically authenticated via cookie
        // Wait a moment for the WebSocket to process the cookie
        setTimeout(() => {
          if (!this.isAuthenticated) {
            console.log('[SSHClient] WebSocket not authenticated via cookie, trying manual auth...')
            // Fallback to manual WebSocket authentication using stored credentials
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
              console.log('[SSHClient] Sending manual auth with stored credentials:', {
                username: wsCredentials.username,
                password: wsCredentials.password ? '[REDACTED]' : '[EMPTY]'
              })
              this.ws.send(JSON.stringify({
                type: 'auth',
                username: wsCredentials.username,
                password: wsCredentials.password
              }))
            }
          }
        }, 1000)
      } else {
        console.error('[SSHClient] HTTP authentication failed:', result.error)
        // Fallback to manual WebSocket authentication using stored credentials
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          console.log('[SSHClient] Sending fallback auth with stored credentials:', {
            username: wsCredentials.username,
            password: wsCredentials.password ? '[REDACTED]' : '[EMPTY]'
          })
          this.ws.send(JSON.stringify({
            type: 'auth',
            username: wsCredentials.username,
            password: wsCredentials.password
          }))
        }
      }
    } catch (error) {
      console.error('[SSHClient] HTTP authentication error:', error)
      // Fallback to manual WebSocket authentication using stored credentials
      if (this.ws && this.ws.readyState === WebSocket.OPEN && wsCredentials) {
        console.log('[SSHClient] Sending error fallback auth with stored credentials:', {
          username: wsCredentials.username,
          password: wsCredentials.password ? '[REDACTED]' : '[EMPTY]'
        })
        this.ws.send(JSON.stringify({
          type: 'auth',
          username: wsCredentials.username,
          password: wsCredentials.password
        }))
      } else if (!wsCredentials) {
        console.error('[SSHClient] No credentials available for fallback authentication')
      }
    }
  }

  private handleMessage(message: any, safeResolve: () => void, safeReject: (error: Error) => void) {
    switch (message.type) {
      case 'auth_success':
        console.log('[SSHClient] Authentication successful!')
        console.log('[SSHClient] Token:', message.token)
        console.log('[SSHClient] User:', message.user)
        this.isAuthenticated = true
        
        // Now perform SSH connection
        setTimeout(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN && this.currentConfig) {
            this.ws.send(JSON.stringify({
              type: 'connect',
              config: {
                host: this.currentConfig.host,
                port: this.currentConfig.port,
                username: this.currentConfig.username,
                authMethod: this.currentConfig.authMethod,
                password: this.currentConfig.password
              }
            }))
          }
        }, 1000)
        break
        
      case 'connected':
        console.log('[SSHClient] SSH connection established')
        safeResolve()
        break
        
      case 'data':
        console.log('[SSHClient] SSH output:', message.data)
        this.dataCallbacks.forEach(callback => callback(message.data))
        break
        
      case 'error':
        console.error('[SSHClient] Error:', message.error)
        this.dataCallbacks.forEach(callback => callback(`\r\nSSH Error: ${message.error}\r\n`))
        break
        
      case 'ping':
        // Respond to ping
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'pong' }))
        }
        break
        
      case 'pong':
        console.log('[SSHClient] Received pong')
        break
        
      case 'status':
        console.log('[SSHClient] Server status:', message.data)
        break
        
      case 'token_refreshed':
        console.log('[SSHClient] Token refreshed:', message.token)
        break
        
      default:
        console.log('[SSHClient] Unknown message type:', message.type, message)
    }
  }

  disconnect(): void {
    console.log('[SSHClient] Disconnecting...')
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ type: 'disconnect' }))
        console.log('[SSHClient] Disconnect message sent')
      } catch (error) {
        console.warn('[SSHClient] Failed to send disconnect message:', error)
      }
    }
    
    if (this.ws) {
      this.ws.close()
      this.ws = null
      console.log('[SSHClient] WebSocket closed')
    }
    
    this.connected = false
    this.connecting = false
    this.isAuthenticated = false
    this.currentConfig = null
  }

  send(data: string): void {
    if (this.ws && this.connected && this.ws.readyState === WebSocket.OPEN && this.isAuthenticated) {
      try {
        console.log('[SSHClient] Sending data to server:', data.replace(/\r/g, '\\r').replace(/\n/g, '\\n'))
        this.ws.send(JSON.stringify({
          type: 'data',
          data: data
        }))
      } catch (error) {
        console.error('[SSHClient] Failed to send data:', error)
        this.connected = false
      }
    } else {
      console.warn('[SSHClient] Cannot send data: Not connected, not authenticated, or WebSocket not open', {
        hasWs: !!this.ws,
        connected: this.connected,
        authenticated: this.isAuthenticated,
        readyState: this.ws?.readyState
      })
    }
  }

  onData(callback: (data: string) => void): void {
    this.dataCallbacks.push(callback)
  }

  onClose(callback: () => void): void {
    this.closeCallbacks.push(callback)
  }

  isConnected(): boolean {
    return this.connected && this.isAuthenticated && this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }

  // Remove callback to prevent memory leaks
  removeDataCallback(callback: (data: string) => void): void {
    const index = this.dataCallbacks.indexOf(callback)
    if (index > -1) {
      this.dataCallbacks.splice(index, 1)
    }
  }

  removeCloseCallback(callback: () => void): void {
    const index = this.closeCallbacks.indexOf(callback)
    if (index > -1) {
      this.closeCallbacks.splice(index, 1)
    }
  }

  // Send ping every 30 seconds for connection keep-alive
  startPingInterval(): void {
    setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000)
  }
}