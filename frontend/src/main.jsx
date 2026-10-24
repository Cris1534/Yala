import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { OfflineProvider } from './offline/OfflineContext.jsx'
import OfflineBanner from './offline/OfflineBanner.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <OfflineProvider>
          <OfflineBanner />
          <App />
        </OfflineProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
