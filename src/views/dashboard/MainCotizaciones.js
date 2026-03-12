import { useState } from 'react'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import useDebounce from './hooks/useDebounce'
import { useCotizaciones } from './hooks/useCotizaciones'

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'nombre', header: 'Nombre del Proyecto' },
  { accessorKey: 'cliente', header: 'Cliente' },
  { id: 'telefono', header: 'Telefono', accessorFn: (row) => row.telefono || '-' },
  { accessorKey: 'total', header: 'Total' },
  { accessorKey: 'ubicacion', header: 'Distrito' },
  {
    id: 'username',
    header: 'Cotizado por:',
    accessorFn: (row) => row.user?.username || '-',
  },
  { accessorKey: 'fecha', header: 'Fecha' },
]

function CotizacionesTable() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 50,
  })

  const [sorting, setSorting] = useState([])
  const [searchValue, setSearchValue] = useState('')
  const debouncedSearch = useDebounce(searchValue, 500)

  function handleChangePageSize(e) {
    setPagination((prev) => ({ ...prev, pageSize: e.target.value }))
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['cotizaciones', pagination.pageIndex, pagination.pageSize, debouncedSearch, sorting],
    queryFn: async () => {
      const start = pagination.pageIndex * pagination.pageSize
      const params = new URLSearchParams({
        limit: pagination.pageSize.toString(),
        offset: start,
      })

      if (debouncedSearch) {
        params.append('search', debouncedSearch)
      }

      if (sorting.length > 0) {
        const sort = sorting[0]
        params.append('order[0][column]', sort.id)
        params.append('order[0][dir]', sort.desc ? 'desc' : 'asc')
      }

      console.log('📌 Parámetros:', params.toString())

      const res = await axios.get('http://localhost:8000/api/cotizaciones/', {
        params,
      })

      console.log('📦 Registros:', res.data.results?.length, 'Start:', start)

      return {
        data: res.data?.results || [],
        recordsTotal: res.data.resultsrecordsTotal,
        recordsFiltered: res.data.results.recordsFiltered,
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
    rowCount: data?.recordsFiltered ?? 0,
    state: {
      pagination,
      sorting,
      globalFilter: debouncedSearch,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
  })

  return (
    <div>
      <input
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Buscar..."
        style={{ marginBottom: '1rem', padding: '8px', width: '300px' }}
      />

      <select onChange={(e) => handleChangePageSize(e)} value={pagination.pageSize}>
        <option value="10">10</option>
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>

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

      {/* Paginación igual */}
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
