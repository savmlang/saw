import './index.css'
import "./utils/theme"

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { TooltipProvider } from '#components/ui/tooltip'
import { Toaster } from '#components/ui/sonner'

import App from './app'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider>
      <App />
      <Toaster />
    </TooltipProvider>
  </StrictMode>,
)
