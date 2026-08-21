import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import StaffApp from './StaffApp.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || '1234567890-mockclientid.apps.googleusercontent.com'}>
        <StaffApp />
      </GoogleOAuthProvider>
    </HelmetProvider>
  </StrictMode>,
)
