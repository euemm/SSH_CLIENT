export interface ClientConfig {
  websocket: {
    endpoint: string;
    authEndpoint: string;
  };
  auth: {
    username: string;
    password: string;
  };
}

export async function getClientConfig(): Promise<ClientConfig> {
  try {
    // In a Next.js app, we can fetch the config from the public directory
    // Note: basePath is /ssh, so we need to include it in the fetch URL
    const response = await fetch('/ssh/config.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch config: ${response.statusText}`);
    }
    const config = await response.json();
    return config;
  } catch (error) {
    console.error('Failed to load client config:', error);
    // Return default config as fallback
    return {
      websocket: {
        endpoint: 'ws://localhost:8080',
        authEndpoint: 'http://localhost:8080/auth/login'
      },
      auth: {
        username: '',
        password: ''
      }
    };
  }
}
