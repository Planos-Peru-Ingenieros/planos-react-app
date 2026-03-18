import { useState } from 'react'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import useDebounce from './hooks/useDebounce'
import './style.css'

const columns = [
  { accessorKey: 'id', header: 'ID', enableSorting: true },
  { accessorKey: 'nombre', header: 'Nombre del Proyecto', enableSorting: true },
  { accessorKey: 'cliente', header: 'Cliente', enableSorting: true },
  {
    id: 'telefono',
    header: 'Teléfono',
    accessorFn: (row) => row.telefono || '-',
    enableSorting: false,
  },
  { accessorKey: 'total', header: 'Total', enableSorting: false },
  { accessorKey: 'ubicacion', header: 'Distrito', enableSorting: true },
  {
    id: 'usuario',
    header: 'Cotizado por',
    accessorFn: (row) => row.user?.first_name || '-',
    enableSorting: true,
  },
  { accessorKey: 'fecha', header: 'Fecha', enableSorting: true },
  { accessorKey: 'estado', header: 'Estado', enableSorting: true },
]

// Campos que tienen filtro por columna
const COLUMN_FILTERS = ['nombre', 'cliente', 'ubicacion', 'usuario']

function CotizacionesTable() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 50 })
  const [sorting, setSorting] = useState([])
  const [searchValue, setSearchValue] = useState('')
  const [columnFilters, setColumnFilters] = useState({})
  const debouncedSearch = useDebounce(searchValue, 500)
  const debouncedColumnFilters = useDebounce(columnFilters, 500)
  const [dateRange, setDateRange] = useState({ fecha_inicio: '', fecha_fin: '' })
  const debouncedDateRange = useDebounce(dateRange, 500)

  const { data, isLoading } = useQuery({
    queryKey: [
      'cotizaciones',
      pagination.pageIndex,
      pagination.pageSize,
      debouncedSearch,
      sorting,
      debouncedColumnFilters,
      debouncedDateRange,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: pagination.pageSize.toString(),
        offset: (pagination.pageIndex * pagination.pageSize).toString(),
      })

      // Search global
      if (debouncedSearch) params.append('search', debouncedSearch)

      // Ordering — formato DRF: ?ordering=-fecha,nombre
      if (sorting.length > 0) {
        const orderingStr = sorting
          .map((s) => `${s.desc ? '-' : ''}${s.id === 'usuario' ? 'user__first_name' : s.id}`)
          .join(',')
        params.append('ordering', orderingStr)
      }

      // Filtros por columna
      Object.entries(debouncedColumnFilters).forEach(([key, val]) => {
        if (val) params.append(key, val)
      })

      // Delimitando fecha
      if (debouncedDateRange.fecha_inicio)
        params.append('fecha_inicio', debouncedDateRange.fecha_inicio)
      if (debouncedDateRange.fecha_fin) params.append('fecha_fin', debouncedDateRange.fecha_fin)

      const res = await axios.get('https://intranet.planosperu.com.pe/api/cotizaciones/', {
        params,
      })
      return {
        data: res.data?.results || [],
        total: res.data?.count || 0,
      }
    },
    keepPreviousData: true,
  })

  function resetAll() {
    setSearchValue('')
    setSorting([])
    setColumnFilters({})
    setDateRange({ fecha_inicio: '', fecha_fin: '' })
    setPagination({ pageIndex: 0, pageSize: 50 })
  }

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: data?.total ?? 0,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: (updater) => {
      setPagination((p) => ({ ...p, pageIndex: 0 })) // reset a página 1 al ordenar
      setSorting(updater)
    },
  })

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <input
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value)
            setPagination((p) => ({ ...p, pageIndex: 0 }))
          }}
          placeholder="Buscar en todo..."
          style={{ padding: '8px', width: '300px' }}
        />
        <label style={{ fontSize: '0.85rem', color: '#666' }}>Desde:</label>
        <input
          type="date"
          value={dateRange.fecha_inicio}
          onChange={(e) => {
            setDateRange((prev) => ({ ...prev, fecha_inicio: e.target.value }))
            setPagination((p) => ({ ...p, pageIndex: 0 }))
          }}
          style={{ padding: '8px' }}
        />
        <label style={{ fontSize: '0.85rem', color: '#666' }}>Hasta:</label>
        <input
          type="date"
          value={dateRange.fecha_fin}
          onChange={(e) => {
            setDateRange((prev) => ({ ...prev, fecha_fin: e.target.value }))
            setPagination((p) => ({ ...p, pageIndex: 0 }))
          }}
          style={{ padding: '8px' }}
        />
        <select
          onChange={(e) =>
            setPagination((p) => ({ ...p, pageSize: Number(e.target.value), pageIndex: 0 }))
          }
          value={pagination.pageSize}
        >
          {[10, 25, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <button onClick={() => setColumnFilters((prev) => ({ ...prev, estado: '' }))}>Todos</button>
        <button onClick={() => setColumnFilters((prev) => ({ ...prev, estado: 'aprobado' }))}>
          Aprobados
        </button>
        <button onClick={() => setColumnFilters((prev) => ({ ...prev, estado: 'pendiente' }))}>
          Pendientes
        </button>
        <button onClick={resetAll}>🔄 Limpiar filtros</button>
      </div>
      <table style={{ borderCollapse: 'collapse', width: '100%', opacity: isLoading ? 0.8 : 1 }}>
        <thead>
          {/* Fila de headers con sorting */}
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort()
                const sorted = header.column.getIsSorted()
                return (
                  <th
                    key={header.id}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    style={{
                      border: '1px solid #ddd',
                      padding: '8px',
                      background: '#f4f4f4',
                      cursor: canSort ? 'pointer' : 'default',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {canSort && (
                      <span style={{ marginLeft: 4 }}>
                        {sorted === 'asc' ? ' ↑' : sorted === 'desc' ? ' ↓' : ' ↕'}
                      </span>
                    )}
                  </th>
                )
              })}
            </tr>
          ))}

          <tr>
            {columns.map((col) => {
              const colKey = col.accessorKey || col.id
              return (
                <td
                  key={col.accessorKey || col.id}
                  style={{ padding: '4px', border: '1px solid #ddd' }}
                >
                  {COLUMN_FILTERS.includes(colKey) ? (
                    <input
                      placeholder={col.header + '...'}
                      value={columnFilters[colKey] || ''}
                      onChange={(e) => {
                        setColumnFilters((prev) => ({ ...prev, [colKey]: e.target.value }))
                        setPagination((p) => ({ ...p, pageIndex: 0 }))
                      }}
                      style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }}
                    />
                  ) : null}
                </td>
              )
            })}
          </tr>
        </thead>

        <tbody>
          <tr>
            <td colSpan={columns.length} style={{ padding: 0, border: 'none' }}>
              {isLoading && (
                <div className="loading-bar-track">
                  <div className="loading-bar-fill" />
                </div>
              )}
            </td>
          </tr>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{ border: '1px solid #ddd', textAlign: 'center', padding: '2rem' }}
              >
                Sin resultados
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* Paginación */}
      <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
          {'<<'}
        </button>
        <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Anterior
        </button>
        <span>
          Página {pagination.pageIndex + 1} de {table.getPageCount() || '?'} — Total:{' '}
          {data?.total ?? 0}
        </span>
        <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Siguiente
        </button>
        <button
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {'>>'}
        </button>
      </div>
    </div>
  )
}

export default CotizacionesTable
