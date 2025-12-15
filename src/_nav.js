import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilSpeedometer, cilFile } from '@coreui/icons' // <--- DEBES IMPORTAR EL ÍCONO cilFile
import { CNavItem, CNavTitle } from '@coreui/react'

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
  // La entrada que agregaste
  {
    component: CNavItem,
    name: 'Formulario Registral',
    to: '/formularios/registral',
    icon: <CIcon icon={cilFile} customClassName="nav-icon" />, // Aquí usamos el icono importado
  },
]

export default _nav