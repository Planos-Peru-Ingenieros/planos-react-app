import React, { Suspense, useEffect, useState } from 'react'
import { HashRouter, Route, Routes, Navigate, useNavigate } from 'react-router-dom'
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

// Componente para manejar la acción de salida
const LogoutAction = ({ onLogout }) => {
  const navigate = useNavigate()
  useEffect(() => {
    localStorage.removeItem('user')
    onLogout()
    navigate('/login')
  }, [onLogout, navigate])
  return null
}

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)
  
  // Estado de autenticación reactivo
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

  const handleLoginSuccess = () => setIsAuthenticated(true)
  const handleLogout = () => setIsAuthenticated(false)

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
          <Route 
            exact 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/" /> : <Login onLoginSuccess={handleLoginSuccess} />} 
          />
          <Route exact path="/register" element={<Register />} />
          <Route exact path="/404" element={<Page404 />} />
          <Route exact path="/500" element={<Page500 />} />
          
          {/* Acción de Logout específica */}
          <Route 
            exact 
            path="/logout" 
            element={<LogoutAction onLogout={handleLogout} />} 
          />

          {/* Rutas protegidas */}
          <Route 
            path="*" 
            element={isAuthenticated ? <DefaultLayout /> : <Navigate to="/login" replace />} 
          />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App