import asyncio
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import HOST, PORT
from .routers import cotizaciones, asistencia, sistema

app = FastAPI()

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir Rutas
app.include_router(cotizaciones.router)
app.include_router(asistencia.router)
app.include_router(sistema.router)

if __name__ == "__main__":
    # Fix para loop de eventos en Windows/Electron
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    print(f"Iniciando servidor en {HOST}:{PORT}")
    loop.run_until_complete(uvicorn.run(app, host=HOST, port=PORT, log_level="info"))