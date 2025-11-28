import React, { useState, useEffect } from 'react';
import CIcon from '@coreui/icons-react'; // Opcional: Si quieres ponerle iconos de CoreUI
import { cilMediaPlay, cilMediaStop } from '@coreui/icons'; // Opcional

const BotonRobot = () => {
  const [activo, setActivo] = useState(false);
  const [loading, setLoading] = useState(false);

  // URL de tu backend Python (FastAPI/Flask)
  const API_URL = 'http://127.0.0.1:5000'; 

  // Color exacto del Sidebar de CoreUI Dark
  const SIDEBAR_COLOR = '#212631'; 

  useEffect(() => {
    fetch(`${API_URL}/api/robot/status`)
      .then(res => res.json())
      .then(data => setActivo(data.active))
      .catch(err => console.log("Backend offline", err));
  }, []);

  const toggleRobot = () => {
    setLoading(true);
    const endpoint = activo ? 'stop' : 'start';
    
    fetch(`${API_URL}/api/robot/${endpoint}`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'started' || data.status === 'running') setActivo(true);
        if (data.status === 'stopped' || data.status === 'stopping') setActivo(false);
        setLoading(false);
      })
      .catch(err => {
        alert("Error conectando con el Robot (asegúrate de ejecutar 'npm run electron')");
        setLoading(false);
      });
  };

  return (
    <button 
      onClick={toggleRobot} 
      disabled={loading}
      className={`btn ${activo ? 'btn-danger' : ''} text-white fw-bold d-flex align-items-center justify-content-center`}
      style={{ 
        minWidth: '200px',
        // Si está activo usa el rojo de bootstrap (btn-danger), si no, usa el color del sidebar
        backgroundColor: activo ? undefined : SIDEBAR_COLOR, 
        borderColor: activo ? undefined : SIDEBAR_COLOR,
        transition: 'all 0.3s ease'
      }}
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Procesando...
        </>
      ) : (
        activo ? (
          <>🛑 Detener Robot</>
        ) : (
          <>🤖 Activar Robot Sunarp</>
        )
      )}
    </button>
  );
};

export default BotonRobot;