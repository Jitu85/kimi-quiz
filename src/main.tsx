import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Global error handlers to display runtime errors on screen
window.addEventListener('error', (event) => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding: 20px; color: #ff3333; background: #0c0f12; font-family: monospace; min-height: 100vh; overflow: auto; border: 1px solid #ff3333;">
      <h1 style="border-bottom: 1px solid #ff3333; padding-bottom: 10px;">Runtime Error</h1>
      <pre style="white-space: pre-wrap; font-size: 14px;">${event.message}\n${event.error?.stack || ''}</pre>
    </div>`;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding: 20px; color: #ff3333; background: #0c0f12; font-family: monospace; min-height: 100vh; overflow: auto; border: 1px solid #ff3333;">
      <h1 style="border-bottom: 1px solid #ff3333; padding-bottom: 10px;">Unhandled Promise Rejection</h1>
      <pre style="white-space: pre-wrap; font-size: 14px;">${event.reason?.stack || event.reason}</pre>
    </div>`;
  }
});

// Set site metadata directly
document.title = 'Olympiad Quiz - Challenge Yourself'
document.documentElement.lang = 'en'

let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
if (!meta) {
  meta = document.createElement('meta')
  meta.name = 'description'
  document.head.appendChild(meta)
}
meta.content = 'An interactive Olympiad quiz platform for students of classes 2-6. Challenge yourself with Science, Maths, and English quizzes.'

createRoot(document.getElementById('root')!).render(<App />)

