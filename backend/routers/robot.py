import threading
from datetime import datetime
from fastapi import APIRouter
from .robot_sunarp.robot_service import iniciar_agente_hilo, stop_event

router = APIRouter(prefix="/robot", tags=["Robot Sunarp"])
robot_thread = None
estado_actual = {"active": False, "logs": []}


def agregar_log(mensaje, tipo="info"):
    hora = datetime.now().strftime("%H:%M:%S")
    estado_actual["logs"].insert(
        0, {"hora": hora, "mensaje": mensaje, "tipo": tipo})
    estado_actual["logs"] = estado_actual["logs"][:20]


@router.get("/status")
def get_status():
    is_alive = robot_thread is not None and robot_thread.is_alive()
    estado_actual["active"] = is_alive
    return estado_actual


@router.post("/start")
def start_robot():
    global robot_thread
    if robot_thread is None or not robot_thread.is_alive():
        estado_actual["logs"] = []
        robot_thread = threading.Thread(
            target=iniciar_agente_hilo, args=(agregar_log,), daemon=True)
        robot_thread.start()
        return {"message": "Iniciado"}
    return {"message": "Ya corre"}


@router.post("/stop")
def stop_robot():
    stop_event.set()
    return {"message": "Señal de parada enviada"}
