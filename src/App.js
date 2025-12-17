import React, { Suspense, useEffect, useState } from 'react'
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import './scss/examples.scss'

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)
  
  // --- NUEVA LÓGICA DE AUTENTICACIÓN ---
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('user'))

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode(theme)
    }

    if (isColorModeSet()) {
      return
    }

    setColorMode(storedTheme)
  }, [isColorModeSet, setColorMode, storedTheme])

  const handleLoginSuccess = () => {
      setIsAuthenticated(true)
    }
    const LogoutAction = ({ onLogout }) => {
    const navigate = useNavigate()
    
    useEffect(() => {
      localStorage.removeItem('user') // Borra los datos del usuario
      onLogout() // Cambia el estado en App.js a false
      navigate('/login') // Redirige al Login
    }, [onLogout, navigate])

    return null // No renderiza nada, solo ejecuta la acción
  }
  // Agrega esto dentro de tu componente App en App.js
  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false); // Esto quita el DefaultLayout y pone el Login
  };

  return (
    <HashRouter>
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          {/* Si ya está logueado y entra a /login, lo mandamos al home */}
          <Route 
            exact 
            path="/login" 
            name="Login Page" 
            element={isAuthenticated ? <Navigate to="/" /> : <Login onLoginSuccess={handleLoginSuccess} />} 
          />
          <Route exact path="/register" name="Register Page" element={<Register />} />
          <Route exact path="/404" name="Page 404" element={<Page404 />} />
          <Route exact path="/500" name="Page 500" element={<Page500 />} />
          
          {/* Ruta protegida: si no está autenticado, siempre manda al login */}
          <Route 
            path="*" 
            name="Home" 
            element={isAuthenticated ? <DefaultLayout /> : <Navigate to="/login" replace />} 
          />
          <Route 
            exact 
            path="/logout" 
            element={<LogoutAction onLogout={() => setIsAuthenticated(false)} />} 
          />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App