import React, { useState, useEffect, useRef } from 'react'
import { 
  CCard, CCardBody, CCardHeader, CCol, CRow, CButton, 
  CTable, CTableBody, CTableDataCell, CTableRow, CBadge, CAlert 
} from '@coreui/react'
import axios from 'axios'
import { useReactToPrint } from 'react-to-print'
import LogReport from './LogReport' // Importación desde la misma carpeta

const RobotSunarp = () => {
  const [status, setStatus] = useState({ active: false, logs: [] })
  const componentRef = useRef(null) // Referencia para el reporte

  // Configuración de react-to-print corregida para evitar errores de consola
  const handlePrint = useReactToPrint({
    contentRef: componentRef, // Requisito de la versión actual para detectar el componente
    documentTitle: `Reporte_Sunarp_${new Date().toLocaleDateString().replace(/\//g, '-')}`,
  })

  const fetchStatus = async () => {
    try {
      const res = await axios.get('http://localhost:5000/robot/status')
      setStatus(res.data)
    } catch (err) { 
      console.error("Sin conexión al backend") 
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <CRow>
      <CCol md={3}>
        <CCard className="shadow-sm">
          <CCardHeader>Control</CCardHeader>
          <CCardBody>
            <CAlert color={status.active ? 'success' : 'secondary'} className="text-center">
              {status.active ? 'TRABAJANDO' : 'EN ESPERA'}
            </CAlert>
            <div className="d-grid gap-2">
              <CButton 
                color="primary" 
                onClick={() => axios.post('http://localhost:5000/robot/start')} 
                disabled={status.active}
              >
                INICIAR
              </CButton>
              <CButton 
                color="danger" 
                onClick={() => axios.post('http://localhost:5000/robot/stop')} 
                disabled={!status.active}
              >
                DETENER
              </CButton>

              {/* BOTÓN EXPORTAR */}
              <CButton 
                color="success" 
                variant="outline" 
                onClick={() => handlePrint()}
                disabled={status.logs.length === 0} // No imprimir si está vacío
              >
                📄 EXPORTAR REPORTE
              </CButton>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol md={9}>
        <CCard className="shadow-sm">
          <CCardHeader>Actividad Detallada (OT | Título | Cambio de Estado)</CCardHeader>
          <CCardBody style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <CTable small hover striped>
              <CTableBody>
                {status.logs.map((log, i) => (
                  <CTableRow key={i}>
                    <CTableDataCell width="100"><strong>{log.hora}</strong></CTableDataCell>
                    <CTableDataCell>
                      <span className={log.mensaje.includes('cambió a') ? 'text-success fw-bold' : ''}>
                        {log.mensaje}
                      </span>
                    </CTableDataCell>
                    <CTableDataCell width="80">
                      <CBadge color={log.tipo === 'success' ? 'success' : log.tipo === 'danger' ? 'danger' : 'info'}>
                        {log.tipo.toUpperCase()}
                      </CBadge>
                    </CTableDataCell>
                  </CTableRow>
                ))}
                {status.logs.length === 0 && (
                  <CTableRow>
                    <CTableDataCell colSpan="3" className="text-center text-muted p-4">
                      Esperando registros de actividad...
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>

      {/* ELEMENTO OCULTO PARA IMPRESIÓN */}
      <div style={{ display: 'none' }}>
        <LogReport ref={componentRef} logs={status.logs} />
      </div>
    </CRow>
  )
}

export default RobotSunarp