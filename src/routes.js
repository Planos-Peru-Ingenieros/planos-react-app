import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Cotizaciones = React.lazy(() => import('./views/cotizaciones/CotizacionesPage'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/cotizaciones', name: 'Cotizaciones', element: Cotizaciones },
]

export default routes
