import React, { useEffect } from 'react'
import { CFormLabel, CFormInput, CFormTextarea, CRow, CCol } from '@coreui/react'

// Componente presentacional para los datos del proyecto
export default function FormularioDatosProyecto({
  detalles,
  setDetalles,
  pisos,
  setPisos,
  area,
  setArea,
  ubicacion,
  setUbicacion,
  titulos,
  setTitulos,
  hasTitulo,
}) {
  return (
    <CRow className="g-3">
      {/* --- Detalles --- */}
      <CCol md={12}>
        <CFormLabel htmlFor="detalles">
          Descripción del Servicio <span className="text-danger">*</span>
        </CFormLabel>
        <CFormTextarea
          name="detalles"
          id="detalles"
          rows="3"
          value={detalles}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.preventDefault()
          }}
          onChange={(e) => {
            setDetalles(e.target.value)
          }}
          onBlur={(e) => {
            const newText = e.target.value.trim().replaceAll(/\s+/g, ' ')
            setDetalles(newText)
          }}
          required
          maxLength={225}
        ></CFormTextarea>
      </CCol>

      {/* --- Número de Pisos --- */}
      <CCol md={6}>
        <CFormLabel htmlFor="pisos">
          N° de niveles del predio <span className="text-danger">*</span>
        </CFormLabel>
        <CFormInput
          type="text"
          name="pisos"
          id="pisos"
          placeholder="3..."
          required
          value={pisos}
          onChange={(e) => {
            if (/^\d{0,2}$/.test(e.target.value)) {
              setPisos(e.target.value)
            }
          }}
        />
      </CCol>

      {/* --- Área (m²) aprox. --- */}
      <CCol md={6}>
        <CFormLabel htmlFor="area">
          Área (m²) aproximada del terreno.<span style={{ color: 'red' }}>*</span>
        </CFormLabel>
        <CFormInput
          type="text"
          name="area"
          id="area"
          placeholder="2..."
          required
          value={area}
          onChange={(e) => {
            if (/^\d{0,6}$/.test(e.target.value)) return setArea(e.target.value)
          }}
        />
      </CCol>

      <CCol md={6}>
        <CFormLabel htmlFor="ubicacion">
          Distrito del Predio <span style={{ color: 'red' }}>*</span>
        </CFormLabel>
        <CFormInput
          type="text"
          name="ubicacion"
          id="ubicacion"
          placeholder="Los Oli..."
          required
          value={ubicacion}
          onChange={(e) => setUbicacion(e.target.value)}
        />
      </CCol>

      {hasTitulo && (
        <CCol md={6}>
          <CFormLabel htmlFor="titulos">N° Titulos (Independizar o Subdividir)</CFormLabel>
          <CFormInput
            type="text"
            name="titulos"
            id="titulos"
            value={titulos}
            placeholder="-"
            onChange={(e) => {
              if (/^\d{0,3}$/.test(e.target.value)) {
                setTitulos(e.target.value)
              }
            }}
          />
        </CCol>
      )}
    </CRow>
  )
}
