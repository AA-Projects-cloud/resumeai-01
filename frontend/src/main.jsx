import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.jsx'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

console.log('🚀 ResumeAI Frontend Starting...')
console.log('🔑 Clerk Key Present:', !!PUBLISHABLE_KEY)

if (!PUBLISHABLE_KEY || PUBLISHABLE_KEY.includes('xxxxxxxx')) {
  console.error('❌ Missing or invalid VITE_CLERK_PUBLISHABLE_KEY in .env.local')
  ReactDOM.createRoot(document.getElementById('root')).render(
    <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#ef4444' }}>⚠️ Configuration Required</h1>
      <p>Missing <strong>VITE_CLERK_PUBLISHABLE_KEY</strong> in your <code>frontend/.env.local</code> file.</p>
      <p>Please copy <code>.env.example</code> to <code>.env.local</code> and fill in your Clerk keys.</p>
    </div>
  )
} else {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    </React.StrictMode>,
  )
}
