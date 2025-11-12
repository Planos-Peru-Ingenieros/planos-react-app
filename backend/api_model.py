from typing import Optional
from pydantic import BaseModel, Field


class PathModel(BaseModel):
    path: str
    message: Optional[str] = None


class HelloModel(BaseModel):
    name: str
    message: Optional[str] = None


class AsistenciaRequest(BaseModel):
    userId: str
    month: int = Field(..., gt=0, lt=13)  # Mes debe ser 1-12
    year: int
    salary: float

# Define la estructura para la respuesta de /api/users


class UserResponse(BaseModel):
    label: str
    value: str
