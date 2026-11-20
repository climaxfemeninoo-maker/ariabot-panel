import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import Auth from './pages/Auth'
import { ToastProvider, useStore } from './ui'
import './styles.css'
import { applyLang } from './i18n'

function Root() {
  const [authed, setAuthed] = useStore('authed', false)
  const [lang] = useStore('lang', 'es-LA')
  React.useEffect(() => { const t = setTimeout(() => applyLang(lang), 0); return () => clearTimeout(t) }, [lang, authed])
  if (!authed) return <Auth onAuth={() => setAuthed(true)} />
  return <BrowserRouter><App /></BrowserRouter>
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ToastProvider><Root /></ToastProvider>
)
