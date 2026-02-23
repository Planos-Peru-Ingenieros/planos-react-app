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
}) {
  return (
    <CRow className="g-3">
      {/* --- DNI / RUC --- */}
      <CCol md={6}>
        <CFormLabel htmlFor="dni">
          <span
            style={{
              color: dni.length === 8 ? '#016f17' : '',
              transition: 'color 400ms ease, text-shadow 400ms ease',
            }}
          >
            DNI
          </span>{' '}
          /{' '}
          <span
            style={{
              color: dni.length === 11 ? '#016f17' : '',
              transition: 'color 400ms ease, text-shadow 400ms ease',
            }}
          >
            RUC
          </span>{' '}
          N°:{' '}
        </CFormLabel>
        <CFormInput
          type="text"
          name="dni"
          id="dni"
          value={dni}
          style={{
            color: (dni.length === 8) | (dni.length === 11) ? '#00c127' : '',
            transition: 'color 400ms ease',
            fontWeight: '500',
          }}
          onChange={(e) => setDni(e.target.value)}
          maxLength={11}
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
    </CRow>
  )
}
