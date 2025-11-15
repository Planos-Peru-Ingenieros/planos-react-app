import React from 'react'
import {
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CRow,
  CCol,
} from '@coreui/react'

// Componente presentacional para los datos del proyecto
export default function FormularioDatosProyecto({
  detalles,
  setDetalles,
  pisos,
  setPisos,
  area,
  setArea,
}) {
  return (
    <CRow className="g-3">
      {/* --- Detalles --- */}
      <CCol md={12}>
        <CFormLabel htmlFor="detalles">
          Detalles <span className="text-danger">*</span>
        </CFormLabel>
        <CFormTextarea
          name="detalles"
          id="detalles"
          rows="3"
          value={detalles}
          onChange={(e) => setDetalles(e.target.value)}
          required
        ></CFormTextarea>
      </CCol>

      {/* --- Número de Pisos --- */}
      <CCol md={6}>
        <CFormLabel htmlFor="pisos">
          Número de Pisos <span className="text-danger">*</span>
        </CFormLabel>
        <CFormInput
          type="text"
          name="pisos"
          id="pisos"
          required
          value={pisos}
          onChange={(e) => setPisos(e.target.value)}
        />
      </CCol>

      {/* --- Área (m²) aprox. --- */}
      <CCol md={6}>
        <CFormLabel htmlFor="area">
          Área (m²) aprox.<span style={{ color: 'red' }}>*</span>
        </CFormLabel>
        <CFormInput
          type="number"
          step="0.01"
          name="area"
          id="area"
          required
          value={area}
          onChange={(e) => setArea(e.target.value)}
        />
      </CCol>
    </CRow>
  )
}