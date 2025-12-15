from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Any

# Importación relativa a la carpeta services
from ..services.excel_service import generar_excel_formulario_registral 

# ==============================================================================
# 1. Definición del Router (Debe llamarse 'router')
# ==============================================================================
router = APIRouter(
    prefix="/formularios",
    tags=["formularios"]
)

# ==============================================================================
# 2. Modelo de Datos (Pydantic)
#    Define la estructura que esperas recibir del Frontend
# ==============================================================================

class FormularioRegistralData(BaseModel):
    # Campos simples
    apellidos: str = ""
    nombres: str = ""
    dni: str = ""
    estado_civil: str = "Soltero"
    domicilio: str = ""
    
    # Lista para las filas largas (ej: Propietarios, Unidades)
    # Usamos List[Any] para flexibilidad, pero puedes definir un modelo Pydantic más estricto si lo necesitas
    lista_datos: List[Any] = [] 
    
    # Si vas a agregar más campos del formulario, agrégalos aquí
    # telefono: Optional[str] = None
    # correo: Optional[str] = None

# ==============================================================================
# 3. Endpoint (Ruta)
# ==============================================================================

@router.post("/crear-formulario-registral")
async def crear_formulario_registral_endpoint(data: FormularioRegistralData):
    """
    Recibe los datos del formulario del Frontend, llama al servicio para
    llenar el Excel y lo devuelve como archivo de descarga.
    """
    try:
        # Convertimos el modelo Pydantic a un diccionario simple para el servicio
        data_dict = data.model_dump()
        
        # Llama a la lógica central en excel_service.py
        archivo_en_memoria = generar_excel_formulario_registral(data_dict)
        
        # Preparamos el nombre del archivo
        nombre_archivo = f"Formulario_{data.apellidos or 'Generado'}.xlsm"
        
        # Devolvemos el archivo como descarga usando StreamingResponse de FastAPI
        headers = {
            'Content-Disposition': f'attachment; filename="{nombre_archivo}"'
        }
        
        return StreamingResponse(
            archivo_en_memoria, 
            media_type='application/vnd.ms-excel.sheet.macroEnabled.12',
            headers=headers
        )

    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=f"Error de plantilla: {str(e)}")
    except Exception as e:
        print(f"Error grave en el endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno del servidor al generar el formulario: {str(e)}")

# Fin del archivo: El router se llama 'router' y es lo que el main.py importa.