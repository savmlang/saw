import './index.css'
import "./utils/theme"
import '@xterm/xterm/css/xterm.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TooltipProvider } from '#components/ui/tooltip'

import App from './app'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider>
      <App />
    </TooltipProvider>
  </StrictMode>,
)
