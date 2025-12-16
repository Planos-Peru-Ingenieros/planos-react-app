from typing import Optional, List
from pydantic import BaseModel

class PathModel(BaseModel):
    path: str
    message: Optional[str] = None

class HelloModel(BaseModel):
    name: str
    message: Optional[str] = None

class AsistenciaRequest(BaseModel):
    userId: str
    month: str  # Recibimos "12" como texto
    year: str   # Recibimos "2025" como texto
    salary: float

class UserResponse(BaseModel):
    label: str
    value: str

class FormularioRegistralRequest(BaseModel):
    apellidos: str
    nombres: str
    dni: str
    estado_civil: str
    domicilio: str
    lista_datos: Optional[List] = []