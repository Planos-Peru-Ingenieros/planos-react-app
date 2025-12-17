import React, { useState, useEffect } from 'react'
import {
  CCard, CCardBody, CCardHeader, CCol, CRow, CButton,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CBadge, CSpinner
} from '@coreui/react'
import axios from 'axios'

const RobotSunarp = () => {
  const [status, setStatus] = useState({ active: false, logs: [] })

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get('http://localhost:5000/robot/status')
        setStatus(res.data)
      } catch (err) { console.error("Error API") }
    }
    fetchStatus()
    const interval = setInterval(fetchStatus, 3000) 
    return () => clearInterval(interval)
  }, [])

  const handleStart = () => axios.post('http://localhost:5000/robot/start')
  const handleStop = () => axios.post('http://localhost:5000/robot/stop')

  return (
    <CRow>
      <CCol md={3}>
        <CCard className="mb-4 shadow-sm">
          <CCardHeader>Panel de Control</CCardHeader>
          <CCardBody className="text-center">
            <div className={`mb-3 p-2 rounded ${status.active ? 'bg-light-success' : 'bg-light'}`}>
                {status.active ? <strong>🟢 TRABAJANDO</strong> : <strong>⚪ IDLE</strong>}
            </div>
            <div className="d-grid gap-2">
              <CButton color="primary" onClick={handleStart} disabled={status.active}>Iniciar Lectura</CButton>
              <CButton color="danger" onClick={handleStop} disabled={!status.active}>Detener Robot</CButton>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol md={9}>
        <CCard className="mb-4 shadow-sm">
          <CCardHeader>Seguimiento Detallado (OT | Título | Estado)</CCardHeader>
          <CCardBody style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <CTable align="middle" hover responsive striped>
              <CTableHead color="dark">
                <CTableRow>
                  <CTableHeaderCell style={{width: '120px'}}>Hora</CTableHeaderCell>
                  <CTableHeaderCell>Detalle del Proceso</CTableHeaderCell>
                  <CTableHeaderCell style={{width: '100px'}}>Nivel</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {status.logs.map((log, index) => (
                  <CTableRow key={index}>
                    <CTableDataCell><strong>{log.hora}</strong></CTableDataCell>
                    <CTableDataCell>
                      {log.mensaje.includes('CAMBIO:') ? (
                        <span className="text-success fw-bold" style={{fontSize: '0.9rem'}}>{log.mensaje}</span>
                      ) : (
                        <span style={{fontSize: '0.9rem'}}>{log.mensaje}</span>
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={log.tipo === 'success' ? 'success' : log.tipo === 'danger' ? 'danger' : 'info'}>
                        {log.tipo.toUpperCase()}
                      </CBadge>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default RobotSunarp