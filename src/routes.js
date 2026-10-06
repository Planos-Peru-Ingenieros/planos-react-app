import React from 'react'

const Cotizaciones = React.lazy(() => import('./views/cotizaciones/CotizacionesPage'))
const Asistencia = React.lazy(() => import('./views/asistencia/Asistencia'))
const RobotSunarp = React.lazy(() => import('./views/robot/RobotSunarp'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/cotizaciones', name: 'Cotizaciones', element: Cotizaciones },
  { path: '/asistencia', name: 'Asistencia', element: Asistencia },
  { path: '/robot-sunarp', name: 'Robot Sunarp', element: RobotSunarp },
]

export default routes
