import React from 'react'

const Cotizaciones = React.lazy(() => import('./views/cotizaciones/CotizacionesPage'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/cotizaciones', name: 'Cotizaciones', element: Cotizaciones },
]

export default routes
