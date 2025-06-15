import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryProvider } from './hooks/QueryProvider'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { preloadEnvironment } from './utils/preload'
import './index.css'
import App from './App.tsx'

// Preload environment before rendering
preloadEnvironment().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryProvider>
        <App />
        <SpeedInsights />
      </QueryProvider>
    </StrictMode>,
  )
}).catch((error) => {
  console.error('Failed to preload environment:', error);
  // Still render the app even if preload fails
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryProvider>
        <App />
        <SpeedInsights />
      </QueryProvider>
    </StrictMode>,
  )
})
