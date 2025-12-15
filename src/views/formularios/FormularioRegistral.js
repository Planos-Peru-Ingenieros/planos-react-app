import React, { useState } from 'react'
import {
  CCard, CCardBody, CCardHeader, CForm, CRow, CCol, CFormInput, CButton, CFormSelect
} from '@coreui/react'

const FormularioRegistral = () => {
  const [loading, setLoading] = useState(false)
  
  // 1. Estado para los campos del formulario
  const [formData, setFormData] = useState({
    apellidos: '',
    nombres: '',
    dni: '',
    estado_civil: 'Soltero',
    domicilio: '',
    // Aquí agregarías el array de lista_datos si estuviera implementado en el formulario
  })

  // 2. Handler genérico para actualizar el estado
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // 3. Función para enviar la petición al backend de FastAPI (Puerto 8000)
  const handleGenerar = async () => {
    setLoading(true)
    try {
      // ***************************************************************
      // CORRECCIÓN CRÍTICA: CAMBIO DE PUERTO 5000 a 8000 y URL correcta para FastAPI
      // http://127.0.0.1:8000/formularios/crear-formulario-registral
      // ***************************************************************
      const response = await fetch('http://127.0.0.1:8000/formularios/crear-formulario-registral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        // Muestra el error específico del servidor si no es exitoso
        const errorText = await response.json();
        throw new Error(`Error en el servidor: ${errorText.detail || response.statusText}`);
      }

      // Descarga del archivo
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Formulario_${formData.apellidos || 'Registral'}.xlsm` // Si no pone apellido, pone 'Registral'
      a.click()
        alert('Formulario Excel generado y descargado correctamente.');

    } catch (error) {
      alert(`Fallo la descarga. Asegúrese que el backend (Puerto 8000) está encendido. Detalle: ${error.message}`);
    } finally {
      setLoading(false)
    }
  }

  return (
    <CCard>
      <CCardHeader>Formulario Registral N° 1</CCardHeader>
      <CCardBody>
        <CForm>
            {/* Campo Domicilio agregado */}
            <CRow className="mb-3">
                <CCol md={12}>
                    <CFormInput label="Domicilio" name="domicilio" onChange={handleChange} />
                </CCol>
            </CRow>
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormInput label="Apellidos" name="apellidos" onChange={handleChange} />
            </CCol>
            <CCol md={6}>
              <CFormInput label="Nombres" name="nombres" onChange={handleChange} />
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol md={4}>
              <CFormInput label="DNI" name="dni" onChange={handleChange} />
            </CCol>
            <CCol md={4}>
              <CFormSelect label="Estado Civil" name="estado_civil" onChange={handleChange}>
                <option value="Soltero">Soltero</option>
                <option value="Casado">Casado</option>
              </CFormSelect>
            </CCol>
          </CRow>
          
          <CButton color="primary" onClick={handleGenerar} disabled={loading}>
            {loading ? 'Generando...' : 'Descargar Excel'}
          </CButton>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default FormularioRegistral