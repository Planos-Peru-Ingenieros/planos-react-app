from fastapi import APIRouter
import threading
from .robot_sunarp.robot_service import iniciar_agente_hilo

router = APIRouter(prefix="/robot", tags=["Robot Sunarp"])

# Variable global para controlar el hilo
robot_thread = None

@router.get("/status")
def get_status():
    global robot_thread
    is_active = robot_thread is not None and robot_thread.is_alive()
    return {"active": is_active}

@router.post("/start")
def start_robot():
    global robot_thread
    if robot_thread is None or not robot_thread.is_alive():
        # Iniciamos el robot en un hilo separado para no bloquear la API
        robot_thread = threading.Thread(target=iniciar_agente_hilo, daemon=True)
        robot_thread.start()
        return {"message": "Robot iniciado"}
    return {"message": "El robot ya está corriendo"}