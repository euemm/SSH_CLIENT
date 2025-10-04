import { ConnectionConfig, SSHClient as ISSHClient } from '../types/ssh'

export class SSHClient implements ISSHClient {
  private ws: WebSocket | null = null
  private connected = false
  private connecting = false
  private dataCallbacks: ((data: string) => void)[] = []
  private closeCallbacks: (() => void)[] = []

  async connect(config: ConnectionConfig): Promise<void> {
    // Prevent multiple simultaneous connections
    if (this.connecting || this.connected) {
      console.warn('[SSHClient] Already connecting or connected, ignoring new connection request')
      return
    }

    console.log('[SSHClient] Starting connection with config:', {
      host: config.host,
      port: config.port,
      username: config.username,
      authMethod: config.authMethod
    })
    
    this.connecting = true
    
    return new Promise((resolve, reject) => {
      let resolved = false
      
      const safeResolve = () => {
        if (!resolved) {
          resolved = true
          this.connecting = false
          this.connected = true
          resolve()
        }
      }
      
      const safeReject = (error: Error) => {
        if (!resolved) {
          resolved = true
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
        
        // For client-side SSH, we'll use a WebSocket connection
        // This would typically connect to a WebSocket-to-SSH proxy server
        const wsUrl = `ws://localhost:8080/ssh`
        console.log('[SSHClient] Creating WebSocket connection to:', wsUrl)
        
        this.ws = new WebSocket(wsUrl)
        
        this.ws.onopen = () => {
          console.log('[SSHClient] WebSocket connection opened successfully')
          
          // Check if WebSocket is still in a valid state
          if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.error('[SSHClient] WebSocket is not in OPEN state')
            safeReject(new Error('WebSocket connection lost'))
            return
          }
          
          // Send connection configuration
          const payload = {
            type: 'connect',
            config: {
              host: config.host,
              port: config.port,
              username: config.username,
              password: config.password,
              privateKey: config.privateKey,
              authMethod: config.authMethod
            }
          }
          console.log('[SSHClient] Sending SSH connection request:', {
            type: payload.type,
            host: config.host,
            port: config.port,
            username: config.username,
            authMethod: config.authMethod
          })
          
          try {
            this.ws.send(JSON.stringify(payload))
            console.log('[SSHClient] SSH connection request sent successfully')
            // For now, resolve immediately after sending the request
            // The actual SSH connection confirmation will come via message
            safeResolve()
          } catch (sendError) {
            console.error('[SSHClient] Failed to send connection request:', sendError)
            safeReject(new Error('Failed to send connection request'))
          }
        }
        
        this.ws.onmessage = (event) => {
          console.log('[SSHClient] Received WebSocket message:', event.data)
          
          try {
            const message = JSON.parse(event.data)
            
            if (message.type === 'data') {
              console.log('[SSHClient] Received data from server')
              this.dataCallbacks.forEach(callback => callback(message.data))
            } else if (message.type === 'error') {
              console.error('[SSHClient] Received error message:', message.error)
              safeReject(new Error(message.error))
            } else if (message.type === 'connected') {
              console.log('[SSHClient] SSH connection confirmed by server')
              safeResolve()
            }
          } catch (parseError) {
            console.error('[SSHClient] Failed to parse message:', parseError)
            safeReject(new Error('Invalid message format'))
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
          this.ws = null
          
          // Only reject if we haven't resolved yet
          if (!resolved) {
            const reason = event.reason || 'Connection lost'
            console.log('[SSHClient] WebSocket closed with code:', event.code)
            
            if (event.code === 1006) {
              console.error('[SSHClient] Connection failed - WebSocket server not available')
              safeReject(new Error('Cannot connect to WebSocket server at ws://localhost:8080/ssh. Please ensure the SSH proxy server is running.'))
            } else {
              console.log('[SSHClient] Rejecting with error for code:', event.code)
              safeReject(new Error(`WebSocket closed: ${reason} (Code: ${event.code})`))
            }
          } else {
            console.log('[SSHClient] Connection already resolved, ignoring close event')
          }
          
          this.closeCallbacks.forEach(callback => callback())
        }
        
        this.ws.onerror = (error) => {
          console.error('[SSHClient] WebSocket error occurred:', error)
          console.log('[SSHClient] Error type:', error.type)
          console.log('[SSHClient] Resolved status:', resolved)
          // Error will be handled by onclose event
        }
        
      } catch (error) {
        console.error('[SSHClient] Exception during connection setup:', error)
        safeReject(error instanceof Error ? error : new Error('Unknown error'))
      }
    })
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
  }

  send(data: string): void {
    if (this.ws && this.connected && this.ws.readyState === WebSocket.OPEN) {
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
      console.warn('[SSHClient] Cannot send data: Not connected or WebSocket not open', {
        hasWs: !!this.ws,
        connected: this.connected,
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
    return this.connected && this.ws !== null && this.ws.readyState === WebSocket.OPEN
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
}

