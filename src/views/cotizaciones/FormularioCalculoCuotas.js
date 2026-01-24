import React from 'react'
import { CFormLabel } from '@coreui/react'

// Componente presentacional para el cálculo de cuotas
export default function FormularioCalculoCuotas({
  montoTotal,
  handleMontoTotalChange,
  montoCuotas,
  fechasCuotas,
}) {
  return (
    <>
      {/* --- Campo para ingresar el monto total --- */}
      <div className="mb-3">
        <CFormLabel htmlFor="montoTotal">
          Precio de Venta <span style={{ color: 'red' }}>*</span>
        </CFormLabel>
        <input
          type="number"
          step="0.01"
          className="form-control" // Usamos className normal, ya que no es un CFormInput
          id="montoTotal"
          value={montoTotal}
          onChange={handleMontoTotalChange}
          placeholder="Ingrese el monto total"
          required
        />
      </div>

      {/* --- Mostrar las cuotas con su fecha al costado --- */}
      <div className="mb-3">
        <CFormLabel>Cuotas</CFormLabel>
        {montoCuotas.length > 0 && fechasCuotas.length > 0 ? (
          <ul>
            {montoCuotas.map((monto, index) => (
              <li key={index}>
                {/* Mostramos la fecha primero, luego la cuota */}
                Fecha: {fechasCuotas[index]} – Cuota {index + 1}: S/. {monto.toFixed(2)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">
            Seleccione una cotización e ingrese un costo para calcular las cuotas.
          </p>
        )}
      </div>
    </>
  )
}