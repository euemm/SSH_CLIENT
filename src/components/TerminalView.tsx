import { useEffect, useRef, useState, useMemo } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import styled from 'styled-components'
import { ConnectionConfig } from '../types/ssh'
import { SSHClient } from '../services/SSHClient'
import { LogOut } from 'lucide-react'
// xterm.css will be imported via layout.tsx

const TerminalContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif;
  margin: 1rem;
  border-radius: var(--lg-radius);
  
  @media (max-width: 768px) {
    margin: 0.5rem;
    margin-bottom: 0;
    padding-bottom: 6rem; /* Space for mobile keyboard */
  }
`

const TerminalHeader = styled.div`
  background: var(--lg-surface);
  backdrop-filter: blur(var(--lg-blur)) saturate(1.2);
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(1.2);
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--lg-stroke);
  border-top-left-radius: var(--lg-radius);
  border-top-right-radius: var(--lg-radius);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 50px;
  box-shadow: 0 2px 8px var(--lg-shadow);
  
  @media (max-width: 768px) {
    padding: 0.6rem 0.75rem;
    min-height: 44px;
  }
`

const ConnectionInfo = styled.div`
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  letter-spacing: -0.01em;
  
  @media (prefers-color-scheme: dark) {
    color: oklch(92% 0 0);
  }
  
  @media (prefers-color-scheme: light) {
    color: oklch(30% 0 0);
  }
  
  @media (max-width: 768px) {
    font-size: 0.7rem;
    gap: 0.25rem;
  }
`

const TerminalActions = styled.div`
  display: flex;
  gap: 0.5rem;
`

const ActionButton = styled.button`
  background: var(--lg-surface);
  backdrop-filter: blur(var(--lg-blur)) saturate(1.2);
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(1.2);
  border: 1px solid var(--lg-stroke);
  border-radius: calc(var(--lg-radius) - 4px);
  padding: 0.6rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--lg-duration-enter) var(--lg-ease-standard);
  min-width: 40px;
  min-height: 40px;
  box-shadow: 0 2px 8px var(--lg-shadow);
  
  @media (prefers-color-scheme: dark) {
    color: oklch(85% 0 0);
  }
  
  @media (prefers-color-scheme: light) {
    color: oklch(40% 0 0);
  }
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px var(--lg-shadow);
  }
  
  &:active {
    transform: translateY(0) scale(0.98);
    transition: transform var(--lg-duration-press) var(--lg-ease-accel);
  }
  
  @media (max-width: 768px) {
    padding: 0.4rem;
    min-width: 40px;
    min-height: 40px;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
`

const TerminalWrapper = styled.div`
  flex: 1;
  padding: 0.75rem;
  overflow: hidden;
  background: transparent;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--lg-surface);
    backdrop-filter: blur(var(--lg-blur)) saturate(1.2);
    -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(1.2);
    z-index: 0;
  }
  
  & > * {
    position: relative;
    z-index: 1;
  }
  
  @media (max-width: 768px) {
    padding: 0.5rem;
    padding-bottom: 0;
    margin-bottom: 0;
  }
`

const StatusBar = styled.div`
  background: var(--lg-surface);
  backdrop-filter: blur(var(--lg-blur)) saturate(1.2);
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(1.2);
  padding: 0.4rem 0.85rem;
  border-top: 1px solid var(--lg-stroke);
  border-bottom-left-radius: var(--lg-radius);
  border-bottom-right-radius: var(--lg-radius);
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 36px;
  box-shadow: 0 -2px 8px var(--lg-shadow);
  
  @media (prefers-color-scheme: dark) {
    color: oklch(70% 0 0);
  }
  
  @media (prefers-color-scheme: light) {
    color: oklch(50% 0 0);
  }
  
  @media (max-width: 768px) {
    padding: 0.35rem 0.65rem;
    font-size: 0.65rem;
    min-height: 32px;
  }
`

const MobileKeyboard = styled.div`
  background: var(--lg-surface);
  backdrop-filter: blur(var(--lg-blur)) saturate(1.2);
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(1.2);
  border-top: 1px solid var(--lg-stroke);
  padding: 0.3rem;
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  
  @media (max-width: 768px) {
    display: block;
  }
`

const MobileKeyRow = styled.div`
  display: flex;
  gap: 0.25rem;
  margin-bottom: 0.25rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`

const MobileKey = styled.button<{ $halfWidth?: boolean }>`
  ${props => props.$halfWidth ? 'flex: 0.5;' : 'flex: 1;'}
  background: var(--lg-surface);
  backdrop-filter: blur(var(--lg-blur)) saturate(1.2);
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(1.2);
  border: 1px solid var(--lg-stroke);
  border-radius: calc(var(--lg-radius) - 6px);
  padding: 0.4rem 0.3rem;
  font-size: 0.7rem;
  font-weight: 500;
  cursor: pointer;
  min-height: 32px;
  transition: all var(--lg-duration-enter) var(--lg-ease-standard);
  white-space: nowrap;
  box-shadow: 0 2px 8px var(--lg-shadow);
  font-family: inherit;
  letter-spacing: -0.01em;
  
  @media (prefers-color-scheme: dark) {
    color: oklch(92% 0 0);
  }
  
  @media (prefers-color-scheme: light) {
    color: oklch(30% 0 0);
  }
  
  &:active {
    transform: scale(0.96);
    transition: transform var(--lg-duration-press) var(--lg-ease-accel);
  }
  
  &.special {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-weight: 600;
    border-color: rgba(255, 255, 255, 0.2);
    
    &:active {
      transform: scale(0.96);
    }
  }
`

interface TerminalViewProps {
  connection: ConnectionConfig
  onDisconnect: () => void
}

export default function TerminalView({ connection, onDisconnect }: TerminalViewProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const terminalInstance = useRef<Terminal | null>(null)
  const fitAddon = useRef<FitAddon | null>(null)
  const sshClient = useRef<SSHClient | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('Connecting...')
  const hasAttemptedConnection = useRef(false)
  const isCleaningUp = useRef(false)
  const hasEstablishedConnection = useRef(false)
  const isMounted = useRef(false)
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const connectionId = useRef<string | null>(null)

  // Memoize connection to prevent unnecessary re-renders
  // Don't include password in dependencies as it can change reference even with same value
  const memoizedConnection = useMemo(() => connection, [
    connection.host,
    connection.port,
    connection.username,
    connection.authMethod
    // Explicitly exclude connection.password to prevent unnecessary re-renders
  ])

  useEffect(() => {
    // Create a unique connection ID to track this specific connection attempt
    const currentConnectionId = `${memoizedConnection.host}:${memoizedConnection.port}:${memoizedConnection.username}:${Date.now()}`
    
    console.log('[TerminalView] useEffect triggered', {
      terminalRefExists: !!terminalRef.current,
      isMounted: isMounted.current,
      connection: memoizedConnection.host + ':' + memoizedConnection.port,
      currentConnectionId,
      previousConnectionId: connectionId.current
    })
    
    if (!terminalRef.current) return
    
    // Prevent multiple mounts - don't reinitialize if already mounted
    if (isMounted.current) {
      console.log('[TerminalView] Component already mounted, skipping re-initialization')
      return
    }
    
    // Set mounted flag immediately to prevent race conditions
    isMounted.current = true
    connectionId.current = currentConnectionId
    
    console.log('[TerminalView] UseEffect running - initializing terminal', {
      connection: memoizedConnection.host + ':' + memoizedConnection.port,
      hasAttemptedConnection: hasAttemptedConnection.current,
      isCleaningUp: isCleaningUp.current
    })
    isCleaningUp.current = false

    // Clean up any existing terminal instance first
    if (terminalInstance.current) {
      try {
        console.log('[TerminalView] Disposing existing terminal instance')
        terminalInstance.current.dispose()
        terminalInstance.current = null
      } catch (error) {
        console.warn('[TerminalView] Error disposing existing terminal:', error)
      }
    }

    // Initialize terminal with mobile-optimized settings
    const isMobile = window.innerWidth <= 768
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    const terminal = new Terminal({
      theme: {
        background: 'transparent',
        foreground: isDark ? '#ffffff' : '#1d1d1f',
        cursor: isDark ? '#667eea' : '#764ba2',
        cursorAccent: isDark ? '#1d1d1f' : '#ffffff',
        selectionBackground: isDark ? 'rgba(103, 126, 234, 0.4)' : 'rgba(118, 75, 162, 0.3)',
        black: isDark ? '#2d3748' : '#4a5568',
        red: '#ff6b6b',
        green: '#51cf66',
        yellow: '#ffd93d',
        blue: '#667eea',
        magenta: '#cc5de8',
        cyan: '#22b8cf',
        white: isDark ? '#f7fafc' : '#2d3748',
        brightBlack: isDark ? '#4a5568' : '#718096',
        brightRed: '#ff8787',
        brightGreen: '#69db7c',
        brightYellow: '#ffe066',
        brightBlue: '#748ffc',
        brightMagenta: '#da77f2',
        brightCyan: '#3bc9db',
        brightWhite: '#ffffff'
      },
      fontSize: isMobile ? 10 : 12,
      fontFamily: "'SF Mono', 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace",
      fontWeight: '400',
      fontWeightBold: '600',
      cursorBlink: true,
      cursorStyle: 'bar',
      scrollback: 1000,
      rows: isMobile ? 30 : 24,
      cols: isMobile ? 60 : 80,
      lineHeight: 1.3,
      letterSpacing: 0.3
    })

    const fit = new FitAddon()
    const webLinks = new WebLinksAddon()

    terminal.loadAddon(fit)
    terminal.loadAddon(webLinks)

    // Ensure the terminal is properly opened before setting refs
    try {
      terminal.open(terminalRef.current)
      
      terminalInstance.current = terminal
      fitAddon.current = fit
      
      // Delay fit() to ensure renderer is ready
      setTimeout(() => {
        try {
          if (fitAddon.current && terminalInstance.current) {
            fitAddon.current.fit()
            console.log('[TerminalView] Terminal fitted successfully')
          }
        } catch (fitError) {
          console.warn('[TerminalView] Failed to fit terminal on init:', fitError)
        }
      }, 100)
      
      console.log('[TerminalView] Terminal initialized successfully')
    } catch (error) {
      console.error('[TerminalView] Failed to initialize terminal:', error)
      return
    }

    // Initialize SSH client
    const client = new SSHClient()
    sshClient.current = client

    // Handle terminal data
    const handleData = (data: string) => {
      if (terminalInstance.current && !isCleaningUp.current) {
        try {
          terminal.write(data)
        } catch (error) {
          console.warn('[TerminalView] Failed to write to terminal:', error)
        }
      }
    }

    const handleClose = () => {
      if (!isCleaningUp.current) {
        console.log('[TerminalView] Connection closed - checking if this is expected')
        setIsConnected(false)
        setConnectionStatus('Disconnected')
        if (terminalInstance.current) {
          try {
            terminal.write('\r\n\r\n[Connection closed]\r\n')
          } catch (error) {
            console.warn('[TerminalView] Failed to write close message:', error)
          }
        }
        
        // Only return to connection form if the connection was actually established
        // This prevents premature disconnection during initial connection attempts
        if (hasEstablishedConnection.current) {
          setTimeout(() => {
            console.log('[TerminalView] Returning to connection form due to established connection close')
            onDisconnect()
          }, 2000)
        } else {
          console.log('[TerminalView] Connection closed before establishment, not returning to form')
        }
      }
    }

    client.onData(handleData)
    client.onClose(handleClose)

    // Connect to SSH server
    const connectToSSH = async () => {
      try {
        console.log('[TerminalView] Initiating SSH connection to:', {
          host: memoizedConnection.host,
          port: memoizedConnection.port,
          username: memoizedConnection.username
        })
        setConnectionStatus('Connecting...')
        await client.connect(memoizedConnection)
        setIsConnected(true)
        setConnectionStatus('Connected')
        hasEstablishedConnection.current = true
        
        // Clear any pending error timeout since connection succeeded
        if (errorTimeoutRef.current) {
          console.log('[TerminalView] Clearing error timeout - connection succeeded')
          clearTimeout(errorTimeoutRef.current)
          errorTimeoutRef.current = null
        }
        
        console.log('[TerminalView] SSH connection established successfully')
        
        // Focus terminal
        try {
          terminal.focus()
        } catch (error) {
          console.warn('[TerminalView] Failed to focus terminal:', error)
        }
      } catch (error) {
        console.error('[TerminalView] SSH connection failed:', error)
        console.error('[TerminalView] Error details:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          type: typeof error
        })
        
        // Check if we're already connected (successful connection happened before error)
        if (isConnected || hasEstablishedConnection.current) {
          console.log('[TerminalView] Connection error after successful connection - ignoring')
          return
        }
        
        setConnectionStatus('Connection failed')
        
        const errorMessage = error instanceof Error ? error.message : String(error)
        try {
          terminal.write(`\r\n\r\nConnection failed: ${errorMessage}\r\n\r\n`)
          terminal.write(`To establish SSH connections, ensure the WebSocket proxy server is running:\r\n`)
          terminal.write(`  cd server\r\n`)
          terminal.write(`  npm install\r\n`)
          terminal.write(`  npm start\r\n\r\n`)
        } catch (writeError) {
          console.warn('[TerminalView] Failed to write error message:', writeError)
        }
        
        // Return to connection form after a short delay
        errorTimeoutRef.current = setTimeout(() => {
          console.log('[TerminalView] Returning to connection form due to connection failure')
          onDisconnect()
        }, 3000)
      }
    }

    // Only attempt connection once per mount and if not already connected
    if (!hasAttemptedConnection.current && !isConnected) {
      console.log('[TerminalView] Component mounted, starting connection...')
      console.log('[TerminalView] Connection attempt flags:', {
        hasAttemptedConnection: hasAttemptedConnection.current,
        isConnected: isConnected,
        isMounted: isMounted.current,
        isCleaningUp: isCleaningUp.current,
        connectionId: connectionId.current
      })
      hasAttemptedConnection.current = true
      
      // Use setTimeout to ensure the terminal is fully initialized before connecting
      setTimeout(() => {
        // Double-check that we're still the same connection attempt
        if (connectionId.current === currentConnectionId && !isCleaningUp.current) {
          console.log('[TerminalView] Proceeding with connection for ID:', currentConnectionId)
          connectToSSH()
        } else {
          console.log('[TerminalView] Connection cancelled - ID mismatch or cleanup in progress', {
            currentConnectionId,
            storedConnectionId: connectionId.current,
            isCleaningUp: isCleaningUp.current
          })
        }
      }, 100)
    } else {
      console.log('[TerminalView] Connection already attempted or connected, skipping', {
        hasAttemptedConnection: hasAttemptedConnection.current,
        isConnected: isConnected,
        isMounted: isMounted.current,
        isCleaningUp: isCleaningUp.current,
        connectionId: connectionId.current
      })
    }

    // Handle terminal input
    terminal.onData((data) => {
      if (client.isConnected()) {
        try {
          client.send(data)
        } catch (error) {
          console.warn('[TerminalView] Failed to send data:', error)
        }
      }
    })

    // Handle window resize with debouncing
    let resizeTimeout: NodeJS.Timeout | null = null
    const handleResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
      resizeTimeout = setTimeout(() => {
        if (fitAddon.current && terminalInstance.current) {
          try {
            fitAddon.current.fit()
          } catch (error) {
            console.warn('[TerminalView] Failed to resize terminal:', error)
          }
        }
      }, 100)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      console.log('[TerminalView] Cleanup function called')
      isCleaningUp.current = true
      
      // Clear any pending resize timeout
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
      
      window.removeEventListener('resize', handleResize)
      
      // Remove callbacks first
      try {
        client.removeDataCallback(handleData)
        client.removeCloseCallback(handleClose)
      } catch (error) {
        console.warn('[TerminalView] Error removing callbacks:', error)
      }
      
      // Disconnect SSH client
      try {
        client.disconnect()
      } catch (error) {
        console.warn('[TerminalView] Error disconnecting SSH client:', error)
      }
      
      // Clear refs before disposal
      const termToDispose = terminalInstance.current
      terminalInstance.current = null
      fitAddon.current = null
      
      // Dispose terminal last with a small delay to ensure all operations are complete
      setTimeout(() => {
        try {
          if (termToDispose) {
            termToDispose.dispose()
            console.log('[TerminalView] Terminal disposed successfully')
          }
        } catch (error) {
          console.warn('[TerminalView] Error disposing terminal:', error)
        }
      }, 0)
      
      // Clear any pending error timeout
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current)
        errorTimeoutRef.current = null
      }
      
      // DO NOT reset these flags in cleanup - they should only be reset on actual component unmount
      // This prevents race conditions where cleanup runs but component is remounted
      console.log('[TerminalView] Cleanup complete - preserving mount state to prevent race conditions')
    }
  }, [memoizedConnection])

  // Separate useEffect to handle component unmount - resets flags only on actual unmount
  useEffect(() => {
    return () => {
      console.log('[TerminalView] Component unmounting - resetting flags')
      // Only reset flags on actual component unmount, not during cleanup
      hasAttemptedConnection.current = false
      hasEstablishedConnection.current = false
      isMounted.current = false
    }
  }, [])

  const handleDisconnect = () => {
    if (sshClient.current) {
      sshClient.current.disconnect()
    }
    onDisconnect()
  }


  const sendMobileKey = (key: string) => {
    if (sshClient.current && sshClient.current.isConnected()) {
      sshClient.current.send(key)
    }
  }

  return (
    <TerminalContainer>
      <TerminalHeader>
        <ConnectionInfo>
          <span>{memoizedConnection.username}@{memoizedConnection.host}:{memoizedConnection.port}</span>
        </ConnectionInfo>
        <TerminalActions>
          <ActionButton onClick={handleDisconnect} title="Disconnect">
            <LogOut size={16} />
          </ActionButton>
        </TerminalActions>
      </TerminalHeader>

      <TerminalWrapper ref={terminalRef} />

      <MobileKeyboard>
        <MobileKeyRow>
          <MobileKey onClick={() => sendMobileKey('\t')}>Tab</MobileKey>
          <MobileKey onClick={() => sendMobileKey('\u0003')}>Ctrl+C</MobileKey>
          <MobileKey onClick={() => sendMobileKey('\u001b')}>Esc</MobileKey>
        </MobileKeyRow>
        <MobileKeyRow>
          <MobileKey $halfWidth onClick={() => sendMobileKey('\u001b[A')}>↑</MobileKey>
          <MobileKey $halfWidth onClick={() => sendMobileKey('\u001b[D')}>←</MobileKey>
          <MobileKey $halfWidth onClick={() => sendMobileKey('\u001b[B')}>↓</MobileKey>
          <MobileKey $halfWidth onClick={() => sendMobileKey('\u001b[C')}>→</MobileKey>
        </MobileKeyRow>
      </MobileKeyboard>

      <StatusBar>
        <span>{connectionStatus}</span>
        <span>Mobile SSH Client</span>
      </StatusBar>
    </TerminalContainer>
  )
}

