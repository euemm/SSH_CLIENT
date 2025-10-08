'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import styled from 'styled-components'
import { ConnectionConfig } from '../src/types/ssh'

// Dynamic imports to prevent SSR issues with xterm.js
const ConnectionForm = dynamic(() => import('../src/components/ConnectionForm'), {
  ssr: false,
  loading: () => <div>Loading...</div>
})

const TerminalView = dynamic(() => import('../src/components/TerminalView'), {
  ssr: false,
  loading: () => <div>Loading terminal...</div>
})

const AppContainer = styled.div`
  height: 100vh;
  height: 100dvh; /* Dynamic viewport height for mobile browsers */
  width: 100vw;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
  

  @media (prefers-color-scheme: dark) {
    background: linear-gradient(
      to bottom,
rgb(24, 26, 29) 0%,
rgb(14, 9, 9) 100%
    );
  }
  

  @supports (-webkit-touch-callout: none) {
    /* iOS Safari specific fix */
    min-height: -webkit-fill-available;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.1);
    z-index: 0;
  }
  
  @keyframes rise {
    0% {
      transform: translateY(0px) translateX(0px);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      transform: translateY(-120vh) translateX(30px);
      opacity: 0;
    }
  }
  
  @keyframes rise2 {
    0% {
      transform: translateY(0px) translateX(0px);
      opacity: 0;
    }
    15% {
      opacity: 1;
    }
    85% {
      opacity: 1;
    }
    100% {
      transform: translateY(-120vh) translateX(-20px);
      opacity: 0;
    }
  }
  
  @keyframes rise3 {
    0% {
      transform: translateY(0px) translateX(0px);
      opacity: 0;
    }
    20% {
      opacity: 1;
    }
    80% {
      opacity: 1;
    }
    100% {
      transform: translateY(-120vh) translateX(40px);
      opacity: 0;
    }
  }
`

const Bubble = styled.div<{ $color: string; $size: number; $delay: number; $duration: number; $animation: string; $left: number; $animationsEnabled: boolean }>`
  position: absolute;
  bottom: -300px;
  left: ${props => props.$left}%;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  border-radius: 50%;
  background: ${props => props.$color};
  box-shadow: 
    0 0 ${props => props.$size / 3}px ${props => props.$color}80,
    0 0 ${props => props.$size}px ${props => props.$color}40;
  animation: ${props => props.$animation} ${props => props.$duration}s linear infinite;
  animation-play-state: ${props => props.$animationsEnabled ? 'running' : 'paused'};
  animation-delay: ${props => props.$delay}s;
  z-index: 1;
`

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  z-index: 10;
`

export default function Home() {
  const [connection, setConnection] = useState<ConnectionConfig | null>(null)
  const [animationsEnabled, setAnimationsEnabled] = useState(true)

  const handleConnection = (config: ConnectionConfig) => {
    console.log('[App] Received connection request:', {
      host: config.host,
      port: config.port,
      username: config.username,
      authMethod: config.authMethod,
      wsUsername: config.wsUsername,
      wsPassword: config.wsPassword ? '[REDACTED]' : '[EMPTY]'
    })
    console.log('[App] Setting connection state')
    // Create a new object to ensure proper state update with all fields
    setConnection({
      host: config.host,
      port: config.port,
      username: config.username,
      authMethod: config.authMethod,
      password: config.password,
      wsUsername: config.wsUsername,
      wsPassword: config.wsPassword
    })
  }

  const handleDisconnect = () => {
    setConnection(null)
  }

  const handleToggleAnimation = () => {
    setAnimationsEnabled(prev => !prev)
  }

  // Generate bubbles with different properties - bigger and slower
  const bubbles = useMemo(() => [
    
    { color: '#ff6b6b', size: 250, delay: 0, duration: 20, animation: 'rise', left: Math.floor(100 / 7) * 0 },
    { color: '#96ceb4', size: 260, delay: 6, duration: 19, animation: 'rise', left: Math.floor(100 / 7) * 1 },
    { color: '#ff9ff3', size: 200, delay: 8, duration: 22, animation: 'rise2', left: Math.floor(100 / 7) * 2 },
    { color: '#6248d9', size: 240, delay: 2, duration: 23, animation: 'rise3', left: Math.floor(100 / 7) * 3 },
    { color: '#4ecdc4', size: 280, delay: 4, duration: 18, animation: 'rise2', left: Math.floor(100 / 7) * 4 },
    { color: '#45b7d1', size: 220, delay: 12, duration: 24, animation: 'rise', left: Math.floor(100 / 7) * 5 },
    { color: '#feca57', size: 210, delay: 14, duration: 21, animation: 'rise3', left: Math.floor(100 / 7) * 6 },
    { color: '#a55eea', size: 190, delay: 10, duration: 17, animation: 'rise2', left: Math.floor(100 / 7) * 7 }
    
  ], [])

  return (
    <AppContainer>
      {bubbles.map((bubble, index) => (
        <Bubble
          key={index}
          $color={bubble.color}
          $size={bubble.size}
          $delay={bubble.delay}
          $duration={bubble.duration}
          $animation={bubble.animation}
          $left={bubble.left}
          $animationsEnabled={animationsEnabled}
        />
      ))}
      <MainContent>
        {connection ? (
          <TerminalView 
            connection={connection} 
            onDisconnect={handleDisconnect}
            onStopAnimation={handleToggleAnimation}
            animationsEnabled={animationsEnabled}
          />
        ) : (
          <ConnectionForm 
            onConnect={handleConnection}
            onToggleAnimation={handleToggleAnimation}
            animationsEnabled={animationsEnabled}
          />
        )}
      </MainContent>
    </AppContainer>
  )
}
