import sys
import os
import asyncio
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import HOST, PORT
from routers import cotizaciones, asistencia, sistema, formularios, robot

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)


app = FastAPI(title="Planos Peru API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cotizaciones.router)
app.include_router(asistencia.router)
app.include_router(sistema.router)
app.include_router(formularios.router)
app.include_router(robot.router)


@app.get("/")
def health_check():
    return {"status": "online", "message": "Backend Planos Peru funcionando"}


if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    print(f"Servidor iniciado en http://{HOST}:{PORT}")

    uvicorn.run(
        app,
        host=HOST,
        port=int(PORT),
        log_level="info",
        reload=False
    )
