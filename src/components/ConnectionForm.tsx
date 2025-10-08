import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { ConnectionConfig } from '../types/ssh'
import { Lock, User, Server, Settings } from 'lucide-react'

const FormContainer = styled.div`
  height: 100%;
  min-height: 0; /* Important for flex children to scroll properly */
  display: flex;
  flex-direction: column;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif;
`

const TitlePanel = styled.div`
  flex-shrink: 0;
  position: relative;
  width: 100%;
  padding: 0.65rem 1rem;
  padding-top: calc(0.65rem + env(safe-area-inset-top));
  background: linear-gradient(
    to bottom,
    var(--lg-surface) 0%,
    var(--lg-surface) 50%,
    color-mix(in srgb, var(--lg-surface) 85%, transparent) 100%
  );
  backdrop-filter: blur(var(--lg-blur)) saturate(1.2);
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(1.2);
  border-bottom: 1px solid var(--lg-stroke);
  box-shadow: 0 4px 20px var(--lg-shadow);
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (prefers-color-scheme: dark) {
    background: linear-gradient(
      to bottom,
      oklch(18% 0 0) 0%,
      oklch(18% 0 0 / 0.5) 30%,
      oklch(18% 0 0 / 0.2) 100%
    );
  }
  
  @media (prefers-color-scheme: light) {
    background: linear-gradient(
      to bottom,
      oklch(100% 0 0) 0%,
      oklch(100% 0 0 / 0.5) 30%,
      oklch(100% 0 0 / 0.2) 100%
    );
  }
  
  @media (max-width: 768px) {
    padding: 1rem 1rem;
    // padding-top: calc(0.5rem + max(12px, env(safe-area-inset-top)));
  }
`

const FormContent = styled.div`
  padding: 2rem 1rem;
  max-width: 500px;
  width: 100%;
  margin: 0 auto;
  flex: 1 1 auto;
  min-height: 0; /* Important for flex children to scroll properly */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem 0.75rem;
    gap: 1rem;
    max-width: 100%;
    justify-content: flex-start;
  }
`

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin: 0;
  
  @media (prefers-color-scheme: dark) {
    color: oklch(98% 0 0);
    text-shadow: 0 1px 2px rgba(0,0,0,.2);
  }
  
  @media (prefers-color-scheme: light) {
    color: oklch(20% 0 0);
  }
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`

const ActionButton = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
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
  
  // &:hover {
  //   transform: translateY(-0.01px);
  //   box-shadow: 0 4px 8px var(--lg-shadow);
  // }
  
  // &:active {
  //   // transform: scale(0.98);
  //   // transition: transform var(--lg-duration-press) var(--lg-ease-accel);
  // }
  
  @media (max-width: 768px) {
    right: 0.75rem;
    padding: 0.4rem;
    min-width: 40px;
    min-height: 40px;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-top: 1rem;
  
  &:first-child {
    margin-top: 0;
  }
  
  @media (max-width: 768px) {
    gap: 0.3rem;
    margin-top: 0.5rem;
  }
`

const Label = styled.label`
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  letter-spacing: -0.01em;
  
  @media (prefers-color-scheme: dark) {
    color: oklch(92% 0 0);
  }
  
  @media (prefers-color-scheme: light) {
    color: oklch(30% 0 0);
  }
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
    
    svg {
      width: 14px;
      height: 14px;
    }
  }
`

const Input = styled.input`
  background: var(--lg-surface);
  backdrop-filter: blur(var(--lg-blur)) saturate(1.2);
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(1.2);
  border: 1px solid var(--lg-stroke);
  border-radius: var(--lg-radius);
  padding: 0.75rem 0.85rem;
  font-size: 0.9rem;
  transition: all var(--lg-duration-enter) var(--lg-ease-standard);
  width: 100%;
  box-shadow: 0 2px 8px var(--lg-shadow);
  font-family: inherit;
  
  @media (prefers-color-scheme: dark) {
    color: oklch(98% 0 0);
  }
  
  @media (prefers-color-scheme: light) {
    color: oklch(20% 0 0);
  }
  
  &:focus {
    outline: none;
    border-color: rgba(103, 126, 234, 0.6);
    box-shadow: 0 2px 12px var(--lg-shadow), 0 0 0 3px rgba(103, 126, 234, 0.12);
    transform: translateY(-1px);
  }
  
  &::placeholder {
    @media (prefers-color-scheme: dark) {
      color: oklch(60% 0 0);
    }
    
    @media (prefers-color-scheme: light) {
      color: oklch(55% 0 0);
    }
  }
  
  @media (max-width: 768px) {
    font-size: 16px; /* Prevents zoom on iOS */
    padding: 0.9rem;
  }
`

const ButtonContainer = styled.div`
  flex-shrink: 0;
  position: relative;
  width: 100%;
  padding: 0.65rem 1rem;
  padding-bottom: calc(0.6rem + env(safe-area-inset-bottom));
  background: linear-gradient(
    to top,
    var(--lg-surface) 0%,
    var(--lg-surface) 50%,
    color-mix(in srgb, var(--lg-surface) 85%, transparent) 100%
  );
  backdrop-filter: blur(var(--lg-blur)) saturate(1.2);
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(1.2);
  border-top: 1px solid var(--lg-stroke);
  box-shadow: 0 -4px 20px var(--lg-shadow);
  
  @media (prefers-color-scheme: dark) {
    background: linear-gradient(
      to top,
      oklch(18% 0 0) 0%,
      oklch(18% 0 0 / 0.5) 30%,
      oklch(18% 0 0 / 0.2) 100%
    );
  }
  
  @media (prefers-color-scheme: light) {
    background: linear-gradient(
      to top,
      oklch(100% 0 0) 0%,
      oklch(100% 0 0 / 0.5) 30%,
      oklch(100% 0 0 / 0.2) 100%
    );
  }
  
  @media (max-width: 768px) {
    padding: 0.5rem 0.75rem;
    padding-bottom: calc(0.4rem + max(12px, env(safe-area-inset-bottom)));
  }
`

const ConnectButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--lg-radius);
  padding: 0.85rem;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: all var(--lg-duration-enter) var(--lg-ease-standard);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 48px;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  box-shadow: 0 4px 16px rgba(103, 126, 234, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  font-family: inherit;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(103, 126, 234, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  
  &:active {
    transform: translateY(0) scale(0.998);
    transition: transform var(--lg-duration-press) var(--lg-ease-accel);
  }
  
  &:disabled {
    background: var(--lg-surface);
    color: oklch(60% 0 0);
    cursor: not-allowed;
    box-shadow: none;
    border-color: var(--lg-stroke);
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem;
    font-size: 0.85rem;
    min-height: 44px;
  }
`

// Removed AuthMethodToggle and AuthOption styled components - password only

interface ConnectionFormProps {
  onConnect: (config: ConnectionConfig) => void
  onToggleAnimation?: () => void
  animationsEnabled?: boolean
}

// Cookie utility functions
const setCookie = (name: string, value: string, days: number = 30) => {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}

const getCookie = (name: string): string | null => {
  const nameEQ = name + '='
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

export default function ConnectionForm({ onConnect, onToggleAnimation, animationsEnabled = true }: ConnectionFormProps) {
  const [host, setHost] = useState('')
  // Fixed port to 22 - removed port input
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [wsUsername, setWsUsername] = useState('')
  const [wsPassword, setWsPassword] = useState('')
  // Removed privateKey state - password only
  // Force password authentication only

  // Load saved values from cookies on component mount
  useEffect(() => {
    const savedHost = getCookie('ssh_host')
    const savedUsername = getCookie('ssh_username')
    const savedWsUsername = getCookie('ws_username')
    
    if (savedHost) {
      setHost(savedHost)
    }
    if (savedUsername) {
      setUsername(savedUsername)
    }
    if (savedWsUsername) {
      setWsUsername(savedWsUsername)
    }
  }, [])
  
  // Debug: Monitor state changes
  useEffect(() => {
    console.log('[ConnectionForm] State updated:', {
      host,
      username,
      password: password ? '[REDACTED]' : '[EMPTY]',
      wsUsername,
      wsPassword: wsPassword ? '[REDACTED]' : '[EMPTY]'
    })
  }, [host, username, password, wsUsername, wsPassword])
  
  const [isConnecting, setIsConnecting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('[ConnectionForm] Form submitted with values:', {
      host,
      username,
      password: password ? '[REDACTED]' : '[EMPTY]',
      wsUsername,
      wsPassword: wsPassword ? '[REDACTED]' : '[EMPTY]'
    })
    
    if (!host || !username || !password || !wsUsername || !wsPassword) {
      console.log('[ConnectionForm] Validation failed: Missing required fields', {
        hasHost: !!host,
        hasUsername: !!username,
        hasPassword: !!password,
        hasWsUsername: !!wsUsername,
        hasWsPassword: !!wsPassword
      })
      return
    }

    // Save host, username, and WebSocket username to cookies
    setCookie('ssh_host', host)
    setCookie('ssh_username', username)
    setCookie('ws_username', wsUsername)

    console.log('[ConnectionForm] Form submitted - Starting connection process')
    setIsConnecting(true)
    
    const config: ConnectionConfig = {
      host,
      port: 22,
      username,
      authMethod: 'password',
      password,
      wsUsername,
      wsPassword
    }

    console.log('[ConnectionForm] Connection config:', {
      host: config.host,
      port: config.port,
      username: config.username,
      authMethod: config.authMethod,
      wsUsername: config.wsUsername,
      wsPassword: config.wsPassword ? '[REDACTED]' : '[EMPTY]'
    })

    try {
      await onConnect(config)
      console.log('[ConnectionForm] Connection successful')
    } catch (error) {
      console.error('[ConnectionForm] Connection failed:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <FormContainer>
      <TitlePanel>
        <Title>SSH Client</Title>
        {onToggleAnimation && (
          <ActionButton onClick={onToggleAnimation} title={animationsEnabled ? "Pause Animation" : "Resume Animation"}>
            <Settings size={16} />
          </ActionButton>
        )}
      </TitlePanel>
      
      <FormContent>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'inherit' }}>
          <FormGroup>
            <Label>
              <Server size={16} />
              Host
            </Label>
            <Input
              type="text"
              placeholder="192.168.1.100"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              required
            />
          </FormGroup>

          {/* Port removed - fixed to 22 */}

          <FormGroup>
            <Label>
              <User size={16} />
              Username
            </Label>
            <Input
              type="text"
              placeholder="root"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>
              <Lock size={16} />
              Password
            </Label>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>
              <User size={16} />
              WebSocket Username
            </Label>
            <Input
              type="text"
              placeholder="admin"
              value={wsUsername}
              onChange={(e) => {
                console.log('[ConnectionForm] WebSocket username changed:', e.target.value)
                setWsUsername(e.target.value)
              }}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>
              <Lock size={16} />
              WebSocket Password
            </Label>
            <Input
              type="password"
              placeholder="WebSocket Password"
              value={wsPassword}
              onChange={(e) => {
                console.log('[ConnectionForm] WebSocket password changed:', e.target.value ? '[REDACTED]' : '[EMPTY]')
                setWsPassword(e.target.value)
              }}
              required
            />
          </FormGroup>
        </form>
      </FormContent>
      
      <ButtonContainer>
        <ConnectButton type="button" disabled={isConnecting} onClick={handleSubmit}>
          {isConnecting ? 'Connecting...' : 'Connect'}
        </ConnectButton>
      </ButtonContainer>
    </FormContainer>
  )
}

