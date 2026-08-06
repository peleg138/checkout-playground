import React from 'react'
import ReactDOM from 'react-dom/client'
import { CheckoutPreviewWrapper } from './playground/components/CheckoutPreviewWrapper'
import { DEFAULT_CONFIG } from './playground/defaultConfig'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div style={{
      minHeight: '100vh',
      background: '#e8e8ea',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <CheckoutPreviewWrapper config={DEFAULT_CONFIG} orientation="portrait" />
    </div>
  </React.StrictMode>,
)
