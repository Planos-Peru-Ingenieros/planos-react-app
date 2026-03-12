import { useQuery } from '@tanstack/react-query'

export const useCotizaciones = (params) => {
  return useQuery({
    queryKey: ['cotizaciones', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams()

      if (params.search) queryParams.append('search', params.search)
      if (params.estado) queryParams.append('estado', params.estado)
      if (params.cliente) queryParams.append('cliente', params.cliente)
      if (params.tipo) queryParams.append('tipo', params.tipo.toString())
      if (params.usuario) queryParams.append('usuario', params.usuario.toString())
      if (params.fecha_inicio) queryParams.append('fecha_inicio', params.fecha_inicio)
      if (params.fecha_fin) queryParams.append('fecha_fin', params.fecha_fin)
      if (params.ordering) queryParams.append('ordering', params.ordering)

      queryParams.append('limit', params.limit?.toString() || '20')
      queryParams.append('offset', params.offset?.toString() || '0')

      const res = await fetch(`http://localhost:8000/api/cotizaciones/?${queryParams}`)
      if (!res.ok) throw new Error('Error fetching cotizaciones')
      return res.json()
    },
  })
}
