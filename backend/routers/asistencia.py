import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from .. import api_model
from ..services import hikvision

router = APIRouter()

@router.get("/api/users")
def get_hikvision_users(): # <--- QUITÉ EL ASYNC AQUÍ
    return hikvision.obtener_usuarios_terminal()

@router.post("/asistencia")
def generar_reporte_asistencia(data: api_model.AsistenciaRequest): # <--- QUITÉ EL ASYNC AQUÍ (IMPORTANTE)
    if not data.userId:
        raise HTTPException(status_code=404, detail=f"ID de usuario requerido.")
    
    try:
        # Generamos el reporte
        ruta_salida = hikvision.procesar_reporte_excel(data.userId, data.year, data.month)
        
        # Verificamos que exista antes de enviarlo
        if not os.path.exists(ruta_salida):
             raise HTTPException(status_code=500, detail="El archivo no se generó correctamente.")

        return FileResponse(
            path=ruta_salida,
            filename=os.path.basename(ruta_salida),
            media_type="application/vnd.ms-excel.sheet.macroEnabled.12",
            headers={"Content-Disposition": f'attachment; filename="{os.path.basename(ruta_salida)}"'}
        )
    except Exception as e:
        print(f"Error generando reporte: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {e}")