import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CButton, CForm, CFormInput, CAlert, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilAccountLogout } from '@coreui/icons'

// IMPORTACIÓN DE IMÁGENES LOCALES
import fondoImg from '../login/image/fondo.jpg'
import logoImg from '../login/image/logo.png'

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/', {
        username: username,
        password: password,
      })
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user))
        onLoginSuccess()
        navigate('/')
      } else {
        setError(response.data.message || 'Credenciales inválidas')
      }
    } catch (err) {
      setError('Error de conexión con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .login-screen {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          background-color: #fff;
          font-family: 'Public Sans', sans-serif;
        }

        .login-left-panel {
          width: 450px;
          padding: 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: #fff;
          z-index: 10;
        }

        .login-right-panel {
          flex: 1;
          background-size: cover;
          background-position: center;
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          padding: 80px;
        }

        .login-right-panel::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.25); 
        }

        .login-text-content {
          position: relative;
          color: white;
          text-align: right;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }

        .login-text-content h1 {
          font-size: 3.2rem;
          font-weight: 700;
          margin-bottom: 5px;
        }

        .login-text-content p {
          font-size: 1.5rem;
          margin: 0;
          font-style: italic;
        }

        .form-label-custom {
          font-size: 0.85rem;
          color: #6c757d;
          font-weight: 600;
          margin-bottom: 8px;
          display: block;
        }

        .input-custom {
          border-radius: 6px !important;
          padding: 10px 15px !important;
          border: 1px solid #dee2e6 !important;
          margin-bottom: 20px;
        }

        .btn-login {
          background-color: #6366f1 !important;
          border: none !important;
          padding: 12px !important;
          font-weight: 600 !important;
          font-size: 0.95rem !important;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s ease;
        }

        .btn-login:hover {
          background-color: #4f46e5 !important;
        }

        .footer-text {
          margin-top: 40px;
          font-size: 0.85rem;
          color: #adb5bd;
        }

        .register-link {
          color: #6366f1;
          text-decoration: none;
          font-weight: 700;
          cursor: pointer;
        }
      `}</style>

      <div className="login-screen">
        {/* LADO IZQUIERDO: FORMULARIO */}
        <div className="login-left-panel">
          <div className="mb-5">
            <img src={logoImg} alt="Logo" width="45" />
          </div>

          <div className="mb-4">
            <h3 className="fw-bold text-dark mb-1">Iniciar Sesión</h3>
            <p className="text-muted small">Ingresa tu usuario y contraseña para acceder.</p>
          </div>

          {error && <CAlert color="danger" className="py-2 small mb-4">{error}</CAlert>}

          <CForm onSubmit={handleLogin}>
            <div className="mb-1">
              <label className="form-label-custom">Usuario</label>
              <CFormInput
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-custom"
                required
              />
            </div>

            <div className="mb-1">
              <label className="form-label-custom">Contraseña</label>
              <CFormInput
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-custom"
                required
              />
            </div>

            <CButton
              type="submit"
              disabled={loading}
              className="w-100 btn-login"
            >
              {loading ? (
                <CSpinner size="sm" className="me-2" />
              ) : (
                <CIcon icon={cilAccountLogout} className="me-2" />
              )}
              {loading ? 'Validando...' : 'Iniciar Sesión'}
            </CButton>
          </CForm>

          <div className="footer-text text-center">
            ¿Eres Postulante? <span className="register-link">Registrarse</span>
          </div>
        </div>

        {/* LADO DERECHO: IMAGEN DE LIMA */}
        <div
          className="login-right-panel"
          style={{ backgroundImage: `url(${fondoImg})` }}
        >
          <div className="login-text-content">
            <h1>Plataforma de Planos Perú</h1>
            <p>" Ingenieros y Arquitectos "</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login