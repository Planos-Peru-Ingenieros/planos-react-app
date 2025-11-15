import React from 'react'

// Componente presentacional para los modales de confirmación
export default function ConfirmacionModals({
  showModal,
  handleCancel,
  handleGeneratePDF,
  showModalJPG,
  handleCancel1,
  handleGenerateJPG,
}) {
  return (
    <>
      {/* --- Modal de Confirmación de PDF --- */}
      {showModal && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">¿Deseas generar el PDF?</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCancel}
                ></button>
              </div>
              <div className="modal-body">
                <p> ¿Quieres crear el PDF ahora?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                >
                  No
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleGeneratePDF} // onClick ahora solo llama a la función
                >
                  Sí
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Modal de Confirmación de JPG --- */}
      {showModalJPG && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">¿Deseas generar el JPG?</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCancel1}
                ></button>
              </div>
              <div className="modal-body">
                <p> ¿Quieres crear el JPG ahora?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel1}
                >
                  No
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleGenerateJPG} // onClick ahora solo llama a la función
                >
                  Sí
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}