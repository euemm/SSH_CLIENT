'use client'

import { useState } from 'react'
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
  width: 100vw;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
  
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

const Bubble = styled.div<{ $color: string; $size: number; $delay: number; $duration: number; $animation: string; $left: number }>`
  position: absolute;
  bottom: -200px;
  left: ${props => props.$left}%;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  border-radius: 50%;
  background: ${props => props.$color};
  box-shadow: 
    0 0 ${props => props.$size / 3}px ${props => props.$color}80,
    0 0 ${props => props.$size}px ${props => props.$color}40;
  animation: ${props => props.$animation} ${props => props.$duration}s linear infinite;
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

  const handleConnection = (config: ConnectionConfig) => {
    console.log('[App] Received connection request:', {
      host: config.host,
      port: config.port,
      username: config.username,
      authMethod: config.authMethod
    })
    setConnection(config)
  }

  const handleDisconnect = () => {
    setConnection(null)
  }

  // Generate bubbles with different properties - bigger and slower
  const bubbles = [
    // Red/Pink bubbles
    { color: '#ff6b6b', size: 250, delay: 0, duration: 20, animation: 'rise', left: 25 },
    { color: '#ff9ff3', size: 200, delay: 8, duration: 22, animation: 'rise2', left: 65 },
    
    // Blue/Cyan bubbles
    { color: '#4ecdc4', size: 280, delay: 4, duration: 18, animation: 'rise2', left: 45 },
    { color: '#45b7d1', size: 220, delay: 12, duration: 24, animation: 'rise', left: 85 },
    
    // Green/Yellow bubbles
    { color: '#96ceb4', size: 260, delay: 6, duration: 19, animation: 'rise', left: 15 },
    { color: '#feca57', size: 210, delay: 14, duration: 21, animation: 'rise3', left: 75 },
    
    // Purple bubbles
    { color: '#5f27cd', size: 240, delay: 2, duration: 23, animation: 'rise3', left: 55 },
    { color: '#a55eea', size: 190, delay: 10, duration: 17, animation: 'rise2', left: 95 }
  ]

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
        />
      ))}
      <MainContent>
        {connection ? (
          <TerminalView 
            connection={connection} 
            onDisconnect={handleDisconnect}
          />
        ) : (
          <ConnectionForm onConnect={handleConnection} />
        )}
      </MainContent>
    </AppContainer>
  )
}
