import React, { useState } from 'react'
import axios from 'axios'
import { CCard, CCardHeader, CCardBody, CButton, CForm, CFormInput } from '@coreui/react'

const Cotizaciones = () => {
  const [path, setPath] = useState('Z:\\')

  const handleOpenExplorer = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:7777/open-explorer/', {
        path: path,
      })
      console.log(response.data)
    } catch (error) {
      console.error('Error opening explorer:', error)
    }
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>Crear Cotizaciones</CCardHeader>
        <CCardBody>
          <CForm>
            <CFormInput
              type="text"
              id="exampleFormControlInput1"
              label="Dirección"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="Z:\"
              aria-describedby="exampleFormControlInputHelpInline"
            />
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
