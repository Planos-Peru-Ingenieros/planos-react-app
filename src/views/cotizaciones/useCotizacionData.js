// Ruta: src/views/cotizaciones/useCotizacionData.js

import { useState, useEffect } from 'react'
import axios from 'axios'

export default function useCotizacionData() {
  const [data, setData] = useState({
    cotizaciones: [], // Inicia como array vacío
    usuarios: [], // Inicia como array vacío
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)

    const fetchCotizaciones = axios.get('http://intranet.planosperu.com.pe/api/tipot/')
    const fetchUsuarios = axios.get('http://intranet.planosperu.com.pe/api/users/')

    Promise.all([fetchCotizaciones, fetchUsuarios])
      .then((responses) => {
        // --- INICIO DE LA CORRECCIÓN ---
        // Nos aseguramos de que SIEMPRE sea un array,
        // incluso si 'results' no viene o es nulo.
        const cotizacionesRes = responses[0]?.data?.results || []
        const usuariosRes = responses[1]?.data?.results || []
        // --- FIN DE LA CORRECCIÓN ---

        setData({
          cotizaciones: cotizacionesRes,
          usuarios: usuariosRes,
        })
      })
      .catch((err) => {
        console.error('Error al obtener datos:', err)
        setError(err)
        // Si hay un error, también nos aseguramos de que sean arrays vacíos
        setData({
          cotizaciones: [],
          usuarios: [],
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return {
    cotizaciones: data.cotizaciones,
    usuarios: data.usuarios,
    loading,
    error,
  }
}
