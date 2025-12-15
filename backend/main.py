import asyncio
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import HOST, PORT

# IMPORTANTE: Aquí importamos el nuevo router 'formularios'
from .routers import cotizaciones
from .routers import asistencia
from .routers import sistema
from .routers import formularios

app = FastAPI()

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, cambia esto por tus dominios reales
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- INCLUIR RUTAS (Routers) ---
app.include_router(cotizaciones.router)
app.include_router(asistencia.router)
app.include_router(sistema.router)

# Registramos el nuevo router del Formulario Registral
app.include_router(formularios.router)

if __name__ == "__main__":
    # Fix para loop de eventos en Windows/Electron (Necesario para PyInstaller/Python 3.8+)
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    
    print(f"✅ Iniciando servidor backend en http://{HOST}:{PORT}")
    print(f"📄 Endpoint Formulario disponible en: http://{HOST}:{PORT}/formularios/crear-formulario-registral")
    
    # Ejecutamos el servidor
    uvicorn.run(app, host=HOST, port=PORT, log_level="info")