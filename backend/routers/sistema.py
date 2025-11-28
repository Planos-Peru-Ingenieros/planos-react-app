import os
from fastapi import APIRouter
from .. import api_model

router = APIRouter()

@router.get("/hello/{name}")
def read_root(name: str):
    return f"hello {name}"

@router.post("/open-explorer/")
def open_explorer(model: api_model.PathModel):
    # Nota: Esto solo funciona si el servidor corre localmente en Windows
    try:
        os.startfile(model.path)
        return f"Opening {model.path}"
    except Exception as e:
        return f"Error opening path: {str(e)}"