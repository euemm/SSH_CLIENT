import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { ConnectionConfig } from '../types/ssh'
import { Lock, User, Server } from 'lucide-react'

const FormContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif;
`

const FormContent = styled.div`
  padding: 2rem 1rem;
  max-width: 500px;
  width: 100%;
  margin: 0 auto;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem 0.75rem;
    gap: 1rem;
    max-width: 100%;
  }
`

const TitlePanel = styled.div`
  background: var(--lg-surface);
  backdrop-filter: blur(var(--lg-blur)) saturate(1.2);
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(1.2);
  border: 1px solid var(--lg-stroke);
  border-radius: var(--lg-radius);
  padding: 1rem;
  margin-bottom: 1.25rem;
  box-shadow: 0 2px 8px var(--lg-shadow);
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 0.85rem;
    margin-bottom: 1rem;
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

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 1.25rem;
  
  &:first-child {
    margin-top: 0;
  }
  
  @media (max-width: 768px) {
    gap: 0.35rem;
    margin-top: 1rem;
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
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: var(--lg-surface);
  backdrop-filter: blur(var(--lg-blur)) saturate(1.2);
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(1.2);
  border-top: 1px solid var(--lg-stroke);
  box-shadow: 0 -4px 20px var(--lg-shadow);
  
  @media (max-width: 768px) {
    padding: 0.75rem;
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

export default function ConnectionForm({ onConnect }: ConnectionFormProps) {
  const [host, setHost] = useState('')
  // Fixed port to 22 - removed port input
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  // Removed privateKey state - password only
  // Force password authentication only

  // Load saved values from cookies on component mount
  useEffect(() => {
    const savedHost = getCookie('ssh_host')
    const savedUsername = getCookie('ssh_username')
    
    if (savedHost) {
      setHost(savedHost)
    }
    if (savedUsername) {
      setUsername(savedUsername)
    }
  }, [])
  const [isConnecting, setIsConnecting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!host || !username || !password) {
      console.log('[ConnectionForm] Validation failed: Missing required fields')
      return
    }

    // Save host and username to cookies
    setCookie('ssh_host', host)
    setCookie('ssh_username', username)

    console.log('[ConnectionForm] Form submitted - Starting connection process')
    setIsConnecting(true)
    
    const config: ConnectionConfig = {
      host,
      port: 22,
      username,
      authMethod: 'password',
      password
    }

    console.log('[ConnectionForm] Connection config:', {
      host: config.host,
      port: config.port,
      username: config.username,
      authMethod: config.authMethod
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
      <FormContent>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'inherit' }}>
          <TitlePanel>
            <Title>SSH Connection</Title>
          </TitlePanel>
          
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
        </form>
      </FormContent>
      
      <ButtonContainer>
        <ConnectButton type="submit" disabled={isConnecting} onClick={handleSubmit}>
          {isConnecting ? 'Connecting...' : 'Connect'}
        </ConnectButton>
      </ButtonContainer>
    </FormContainer>
  )
}

