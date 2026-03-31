// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )


import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AsgardeoProvider } from '@asgardeo/react'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AsgardeoProvider
      clientId="UpgcjVlB3dRT5WGqHzBmAVC3BjIa"
      baseUrl="https://api.asgardeo.io/t/sabtamorg"
      signInRedirectURL="http://localhost:5173/"
      signOutRedirectURL="http://localhost:5173/"
      scopes="openid profile"
    >
      <App />
    </AsgardeoProvider>
  </StrictMode>
)