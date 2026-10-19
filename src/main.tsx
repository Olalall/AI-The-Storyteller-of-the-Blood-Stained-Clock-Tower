import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { SessionBootstrap } from './app/SessionBootstrap'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessionBootstrap><App /></SessionBootstrap>
  </StrictMode>,
)
