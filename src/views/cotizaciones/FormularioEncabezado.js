// Ruta: src/views/cotizaciones/FormularioEncabezado.js

import React, { useMemo } from 'react'
import Select from 'react-select'
import { CFormLabel } from '@coreui/react'

export default function FormularioEncabezado({
  usuarios,
  cotizacion, // A veces puede ser 'undefined' en el primer render
  usuarioSeleccionado,
  handleUsuarioChange,
  cotizacionSeleccionado,
  handleCotizacionChange,
  loading,
}) {
  const opcionesUsuario = useMemo(
    () =>
      // --- CORRECCIÓN DE SEGURIDAD ---
      (Array.isArray(usuarios) ? usuarios : []).map((usuario) => ({
        value: usuario.username,
        label: usuario.username,
      })),
    [usuarios],
  )

  const opcionesCotizacion = useMemo(() => {
    // --- CORRECCIÓN DE SEGURIDAD ---
    // Si 'cotizacion' no es un array, usamos uno vacío.
    const cotizacionesArray = Array.isArray(cotizacion) ? cotizacion : []

    const mapAndSort = (items) =>
      items
        .map((c) => ({
          value: c.id,
          label: c.nom_tipo,
        }))
        .sort((a, b) => a.label.localeCompare(b.label))

    // Ahora usamos 'cotizacionesArray' que sabemos que es seguro
    const masSolicitado = cotizacionesArray.filter(
      (c) => c.entidad?.toLowerCase().trim() === 'mas solicitado',
    )
    const sunarp = cotizacionesArray.filter(
      (c) => c.entidad?.toLowerCase().trim() === 'sunarp',
    )
    const otros = cotizacionesArray.filter(
      (c) =>
        c.entidad?.toLowerCase().trim() !== 'sunarp' &&
        c.entidad?.toLowerCase().trim() !== 'mas solicitado',
    )

    return [
      { label: 'Mas solicitado', options: mapAndSort(masSolicitado) },
      { label: 'SUNARP', options: mapAndSort(sunarp) },
      { label: 'OTROS', options: mapAndSort(otros) },
    ]
  }, [cotizacion]) 

  const valorCotizacionActual = useMemo(() => {
    if (!cotizacionSeleccionado) return null
    const allOptions = opcionesCotizacion.flatMap((group) => group.options)
    return allOptions.find((c) => c.value === cotizacionSeleccionado) || null
  }, [cotizacionSeleccionado, opcionesCotizacion])

  return (
    <div className="row">
      <div className="col-md-6 mb-3">
        <CFormLabel htmlFor="user">
          Usuario<span style={{ color: 'red' }}>*</span>
        </CFormLabel>
        <Select
          options={opcionesUsuario}
          value={
            usuarioSeleccionado
              ? { value: usuarioSeleccionado, label: usuarioSeleccionado }
              : null
          }
          onChange={handleUsuarioChange}
          placeholder={loading ? 'Cargando...' : 'Seleccione un usuario'}
          isDisabled={loading}
          inputId="user"
        />
      </div>

      <div className="col-md-6 mb-3">
        <label className="form-label">
          Cotización <span style={{ color: 'red' }}>*</span>
        </label>
        <Select
          options={opcionesCotizacion}
          value={valorCotizacionActual}
          onChange={handleCotizacionChange}
          placeholder={loading ? 'Cargando...' : 'Seleccione una cotización'}
          isDisabled={loading}
        />
      </div>
    </div>
  )
}