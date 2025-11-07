import React, { useState } from 'react'
import Select from 'react-select'
import axios from 'axios'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
  CCol,
} from '@coreui/react'

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' },
]

const Cotizaciones = () => {
  const [path, setPath] = useState('Z:\\')

  const handleOpenExplorer = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:7777/open-explorer/', {
        path: path,
      })
      console.log(response.data)
    } catch (error) {
      alert('Error opening explorer: ' + (error.response?.data || error.message))
    }
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>Crear Cotizaciones</CCardHeader>
        <CCardBody>
          <CForm className="row g-3">
            <CCol md={6}>
              <CFormLabel htmlFor="user">Usuario</CFormLabel>
              <Select options={options} />
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="user">Usuario</CFormLabel>
              <Select options={options} />
            </CCol>
            <CButton color="primary" onClick={handleOpenExplorer} className="mt-3">
              Abrir Explorador
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </>
  )
}

export default Cotizaciones
