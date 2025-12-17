import React, { useState, useEffect } from 'react'
import { CCard, CCardBody, CCardHeader, CButton, CAlert, CSpinner } from '@coreui/react'
import axios from 'axios'

const RobotSunarp = () => {
  const [isActive, setIsActive] = useState(false)
  const [loading, setLoading] = useState(false)

  // Consultar si el robot está prendido al cargar la página
  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    const res = await axios.get('http://localhost:5000/robot/status')
    setIsActive(res.data.active)
  }

  const handleToggleRobot = async () => {
    setLoading(true)
    if (!isActive) {
      await axios.post('http://localhost:5000/robot/start')
    }
    // Esperamos un segundo y actualizamos estado
    setTimeout(() => {
      checkStatus()
      setLoading(false)
    }, 1000)
  }

  return (
    <CCard>
      <CCardHeader>
        <strong>Gestor de Robot Sunarp</strong>
      </CCardHeader>
      <CCardBody className="text-center">
        <div className="mb-4">
          <CAlert color={isActive ? 'success' : 'danger'}>
            El Robot se encuentra actualmente: <strong>{isActive ? 'ACTIVO' : 'DETENIDO'}</strong>
          </CAlert>
        </div>
        
        <CButton 
          color={isActive ? 'secondary' : 'primary'} 
          size="lg"
          onClick={handleToggleRobot}
          disabled={loading || isActive}
        >
          {loading ? <CSpinner size="sm"/> : (isActive ? 'ROBOT EN EJECUCIÓN' : 'ENCENDER ROBOT')}
        </CButton>
        
        <p className="mt-3 text-muted">
          * Al encenderlo, el robot buscará expedientes pendientes en la Intranet y abrirá Chrome automáticamente.
        </p>
      </CCardBody>
    </CCard>
  )
}

export default RobotSunarp