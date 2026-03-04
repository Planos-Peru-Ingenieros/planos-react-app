import { useState } from 'react'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'nombre', header: 'Nombre / Razón Social' },
  { accessorKey: 'titulo', header: 'Título' },
  { accessorKey: 'cliente', header: 'Cliente' },
  // Agrega más si quieres: 'total', 'fecha', 'estado', 'ubicacion', etc.
]

function CotizacionesTable() {
  const [pagination, setPagination] = useState({
    pageIndex: 0, // ← importante: empieza en 0
    pageSize: 10,
  })

  const [sorting, setSorting] = useState([])

  const [globalFilter, setGlobalFilter] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['cotizaciones', pagination.pageIndex, pagination.pageSize, globalFilter, sorting],
    queryFn: async () => {
      const start = pagination.pageIndex * pagination.pageSize
      const params = new URLSearchParams({
        format: 'datatables',
        draw: pagination.pageIndex + 1,
        start: start.toString(),
        length: pagination.pageSize.toString(),
      })

      if (globalFilter) {
        params.append('search[value]', globalFilter)
      }

      if (sorting.length > 0) {
        const sort = sorting[0]
        params.append('order[0][column]', sort.id)
        params.append('order[0][dir]', sort.desc ? 'desc' : 'asc')
      }

      console.log('📌 Parámetros:', params.toString())

      const res = await axios.get('https://intranet.planosperu.com.pe/api/cotizaciones/', {
        params: params,
      })

      console.log('📦 Respuesta - Registros:', res.data.data?.length, 'Start enviado:', start)

      return {
        data: res.data.data || [],
        recordsTotal: res.data.recordsTotal,
        recordsFiltered: res.data.recordsFiltered,
      }
    },
    keepPreviousData: true,
  })

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: data?.recordsFiltered ?? 0, // ← clave para que "Siguiente" se habilite
    state: {
      pagination,
      sorting,
      globalFilter,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
  })

  return (
    <div>
      <input
        value={globalFilter ?? ''}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="Buscar..."
        style={{ marginBottom: '1rem', padding: '8px', width: '300px' }}
      />

      {isLoading ? (
        <p>Cargando cotizaciones...</p>
      ) : table.getRowModel().rows.length === 0 ? (
        <p>No se encontraron resultados</p>
      ) : (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{ border: '1px solid #ddd', padding: '8px', background: '#f4f4f4' }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Anterior
        </button>

        <span>
          Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || '?'}
        </span>

        <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Siguiente
        </button>
      </div>
    </div>
  )
}

export default CotizacionesTable
