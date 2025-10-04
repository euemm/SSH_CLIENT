export interface ConnectionConfig {
  host: string
  port: number
  username: string
  password?: string
  privateKey?: string
  authMethod: 'password' | 'key'
  wsUsername: string
  wsPassword: string
}

export interface SSHClient {
  connect(config: ConnectionConfig): Promise<void>
  disconnect(): void
  send(data: string): void
  onData(callback: (data: string) => void): void
  onClose(callback: () => void): void
  isConnected(): boolean
}

export interface TerminalSize {
  cols: number
  rows: number
}

