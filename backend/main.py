import sys
import os
import asyncio
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Configuración de rutas para PyInstaller
# Esto asegura que el ejecutable encuentre los módulos routers, services, etc.
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from config import HOST, PORT
from routers import cotizaciones, asistencia, sistema, formularios

app = FastAPI(title="Planos Peru API")

# Configuración CORS mejorada para Electron
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

@app.get("/")
def health_check():
    return {"status": "online", "message": "Backend Planos Peru funcionando"}

if __name__ == "__main__":
    # Fix para el loop de eventos en Windows (evita el Warning: "no current event loop")
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    print(f"Iniciando servidor backend en http://{HOST}:{PORT}")
    print(f"Endpoint Formulario disponible en: http://{HOST}:{PORT}/formularios/crear-formulario-registral")
    
    # --- CAMBIO CRÍTICO PARA EL EXE ---
    # Usamos app (el objeto) en lugar de "main:app" (el string)
    uvicorn.run(
        app, 
        host=HOST, 
        port=int(PORT), 
        log_level="info",
        reload=False  # reload debe ser False en el ejecutable
    )