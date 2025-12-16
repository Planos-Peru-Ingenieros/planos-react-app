import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

import asyncio
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import HOST, PORT
from routers import cotizaciones, asistencia, sistema, formularios

app = FastAPI()

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- INCLUIR RUTAS (Routers) ---
app.include_router(cotizaciones.router)
app.include_router(asistencia.router)
app.include_router(sistema.router)
app.include_router(formularios.router)

if __name__ == "__main__":
    # Fix para loop de eventos en Windows/Electron
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    
    print(f"Iniciando servidor backend en http://{HOST}:{PORT}")
    print(f"Endpoint Formulario disponible en: http://{HOST}:{PORT}/formularios/crear-formulario-registral")
    
    # Ejecutamos el servidor
    uvicorn.run(app, host=HOST, port=PORT, log_level="info")