import React from 'react'

// Usamos forwardRef para que RobotSunarp pueda "apuntar" a este componente
const LogReport = React.forwardRef(({ logs }, ref) => {
  return (
    <div ref={ref} style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#321fdb', margin: '0' }}>PLANOS PERÚ</h2>
        <h4 style={{ color: '#4f5d73', marginTop: '5px' }}>REPORTE DE ACTIVIDAD - ROBOT SUNARP</h4>
        <hr style={{ border: '1px solid #ebedef' }} />
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <span><strong>Fecha de reporte:</strong> {new Date().toLocaleDateString()}</span>
        <span><strong>Hora:</strong> {new Date().toLocaleTimeString()}</span>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th style={{ border: '1px solid #d8dbe0', padding: '10px', textAlign: 'left' }}>HORA</th>
            <th style={{ border: '1px solid #d8dbe0', padding: '10px', textAlign: 'left' }}>DETALLE DE ACTIVIDAD</th>
            <th style={{ border: '1px solid #d8dbe0', padding: '10px', textAlign: 'center' }}>TIPO</th>
          </tr>
        </thead>
        <tbody>
          {logs && logs.length > 0 ? (
            logs.map((log, i) => (
              <tr key={i}>
                <td style={{ border: '1px solid #d8dbe0', padding: '8px' }}>{log.hora}</td>
                <td style={{ border: '1px solid #d8dbe0', padding: '8px' }}>{log.mensaje}</td>
                <td style={{ border: '1px solid #d8dbe0', padding: '8px', textAlign: 'center' }}>
                  {log.tipo.toUpperCase()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>No hay registros para mostrar.</td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ marginTop: '40px', fontSize: '10px', textAlign: 'right', color: '#768192' }}>
        Documento generado por el Sistema de Automatización Planos Perú © 2025
      </div>
    </div>
  )
})

LogReport.displayName = 'LogReport'
export default LogReport