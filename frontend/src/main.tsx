import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryProvider } from './hooks/QueryProvider'
import { SpeedInsights } from '@vercel/speed-insights/react'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <App />
      <SpeedInsights />
    </QueryProvider>
  </StrictMode>,
)
