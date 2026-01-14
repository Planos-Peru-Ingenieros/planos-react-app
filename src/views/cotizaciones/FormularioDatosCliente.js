import React from 'react'
import { CFormLabel, CFormInput, CRow, CCol } from '@coreui/react'

// Componente presentacional para los datos del cliente
export default function FormularioDatosCliente({
  dni,
  setDni,
  cliente,
  setCliente,
  telefono,
  setTelefono,
  ubicacion,
  setUbicacion,
}) {
  return (
    <CRow className="g-3">
      {/* --- DNI / RUC --- */}
      <CCol md={6}>
        <CFormLabel htmlFor="dni">DNI / RUC N°: </CFormLabel>
        <CFormInput
          type="text"
          name="dni"
          id="dni"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
        />
      </CCol>

      {/* --- Cliente / Empresa --- */}
      <CCol md={6}>
        <CFormLabel htmlFor="cliente">
          Nombre del Cliente o la Empresa que Representa <span style={{ color: 'red' }}>*</span>
        </CFormLabel>
        <CFormInput
          type="text"
          name="cliente"
          id="cliente"
          required
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
        />
      </CCol>

      {/* --- Teléfono --- */}
      <CCol md={6}>
        <CFormLabel htmlFor="telefono">N° de Teléfono del Cliente</CFormLabel>
        <CFormInput
          type="text"
          name="telefono"
          id="telefono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
      </CCol>

      {/* --- Ubicación --- */}
      <CCol md={6}>
        <CFormLabel htmlFor="ubicacion">
          Distrito del Predio <span style={{ color: 'red' }}>*</span>
        </CFormLabel>
        <CFormInput
          type="text"
          name="ubicacion"
          id="ubicacion"
          required
          value={ubicacion}
          onChange={(e) => setUbicacion(e.target.value)}
        />
      </CCol>
    </CRow>
  )
}
