import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/liquid-glass.css'

// Note: StrictMode is temporarily disabled to prevent terminal renderer issues
// StrictMode causes components to mount twice in development, which causes
// xterm.js renderer errors. Re-enable for production builds.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)

