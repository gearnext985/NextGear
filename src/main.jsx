import { createRoot } from 'react-dom/client'

createRoot(document.getElementById('root')).render(
  <div style={{ padding: '50px', color: 'black' }}>
    <h1>Main.jsx Root Test</h1>
    <p>If you see this, React is mounting correctly on the root element.</p>
  </div>
)
