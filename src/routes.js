import React from 'react'

// 1. IMPORTA LA VISTA QUE YA EXISTÍA
const Cotizaciones = React.lazy(() => import('./views/cotizaciones/CotizacionesPage'))
const Asistencia = React.lazy(() => import('./views/asistencia/Asistencia'))

// 2. IMPORTA EL NUEVO COMPONENTE (DEBE COINCIDIR CON LA RUTA DEL PASO 1)
const FormularioRegistral = React.lazy(() => import('./views/formularios/FormularioRegistral'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/cotizaciones', name: 'Cotizaciones', element: Cotizaciones },
  { path: '/asistencia', name: 'Asistencia', element: Asistencia },
  { path: '/formularios/registral', name: 'Formulario Registral', element: FormularioRegistral },
]

export default routes