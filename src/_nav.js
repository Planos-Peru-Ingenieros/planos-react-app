import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilSpeedometer, cilFile, cilAccountLogout, cilSettings } from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'

const LogoutItem = () => {
  const handleLogout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh') // o como los tengas nombrados
    window.location.href = '/login' // redirige al login
  }

  return (
    <CNavItem onClick={handleLogout} style={{ cursor: 'pointer', background: 'red' }}>
      <span className="nav-link">
        <CIcon icon={cilAccountLogout} customClassName="nav-icon" />
        Cerrar Sesión
      </span>
    </CNavItem>
  )
}

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Componentes',
  },
  {
    component: CNavItem,
    name: 'Cotizaciones',
    to: '/cotizaciones',
    icon: <CIcon icon={cilPencil} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Asistencia',
    to: '/asistencia',
    icon: <CIcon icon={cilPencil} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Formulario Registral',
    to: '/formularios/registral',
    icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
  },
  // --- SECCIÓN DE SALIDA ---
  {
    component: CNavTitle,
    name: 'Sistema',
  },
  {
    component: CNavItem,
    name: 'Robot Sunarp',
    to: '/robot-sunarp',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Cerrar Sesión',
    to: '/logout',
    icon: <CIcon icon={cilAccountLogout} customClassName="nav-icon" />,
  },
]

export default _nav
