import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { AddMediaRow } from './components/UI/AddMediaRow'
import './index.css'

function Demo() {
  const [logo, setLogo] = useState<File | null>(null)
  const [loaderJson, setLoaderJson] = useState<File | null>(null)
  const [loaderImg, setLoaderImg] = useState<File | null>(null)

  return (
    <div style={{ minHeight: '100vh', background: '#AEAEAE', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '32px' }}>
      <div style={{ width: '500px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <AddMediaRow label="Logo" value={logo} onChange={setLogo} accept="image/*" />
        <AddMediaRow label="Loader Animation" value={loaderJson} onChange={setLoaderJson} accept=".json,image/*" />
        <AddMediaRow label="Loader Animation" value={loaderImg} onChange={setLoaderImg} accept="image/*" />
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Demo />
  </React.StrictMode>,
)
