import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Cotizaciones = React.lazy(() => import('./views/cotizaciones/CotizacionesPage'))
const Asistencia = React.lazy(() => import('./views/asistencia/Asistencia'))
const RobotSunarp = React.lazy(() => import('./views/robot/RobotSunarp'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/cotizaciones', name: 'Cotizaciones', element: Cotizaciones },
  { path: '/asistencia', name: 'Asistencia', element: Asistencia },
  { path: '/robot-sunarp', name: 'Robot Sunarp', element: RobotSunarp },
]

export default routes
