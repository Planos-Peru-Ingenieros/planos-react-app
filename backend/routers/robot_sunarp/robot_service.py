import sys
import os
import threading
import time
import requests

# Configuración de rutas para el EXE
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

try:
    from sunarp_scraper import consultar_estado_sunarp
except ImportError:
    from .sunarp_scraper import consultar_estado_sunarp

stop_event = threading.Event()


def iniciar_agente_hilo(agregar_log_func):
    global stop_event
    stop_event.clear()
    URL_BASE = "https://www.planosperu.com.pe/intranet/"

    try:
        agregar_log_func("Buscando expedientes en Intranet...", "info")
        resp = requests.get(f"{URL_BASE}/api/robot/pendientes/", timeout=10)

        if resp.status_code == 200:
            tareas = resp.json().get("tareas", [])
            if not tareas:
                agregar_log_func("💤 Sin títulos pendientes.", "info")
                return

            for tarea in tareas:
                if stop_event.is_set():
                    agregar_log_func("⏹️ PROCESO INTERRUMPIDO.", "danger")
                    break

                # USAMOS ot_id (el número real 2010, 2002)
                ot_visible = tarea.get('ot_id', 'N/A')
                titulo = tarea['titulo']
                anio = tarea['anio']
                oficina = tarea.get('oficina', 'LIMA').upper()
                estado_previo = str(tarea.get('estado', '')).strip().upper()

                agregar_log_func(
                    f"🚀 Procesando OT: {ot_visible} | Título: {titulo} | Estado: {estado_previo}", "info")

                nuevo_estado = consultar_estado_sunarp(anio, titulo, oficina)

                if nuevo_estado and "Error" not in nuevo_estado:
                    nuevo_estado = nuevo_estado.strip().upper()

                    # FORMATO DE MENSAJE CORTO
                    if nuevo_estado == estado_previo:
                        detalle = f"OT: {ot_visible} | TITULO: {titulo} ({anio}) -> El expediente no ha cambiado."
                    else:
                        detalle = f"OT: {ot_visible} | TITULO: {titulo} ({anio}) -> El estado cambió a {nuevo_estado}"

                    agregar_log_func(detalle, "success")
                    requests.post(f"{URL_BASE}/api/robot/guardar/",
                                  json={"id": tarea['id'], "estado": nuevo_estado})
                else:
                    agregar_log_func(
                        f"⚠️ OT: {ot_visible} | Falló consulta Sunarp.", "danger")

                time.sleep(5)  # Pausa de seguridad
        else:
            agregar_log_func(f"❌ Error API: {resp.status_code}", "danger")
    except Exception as e:
        agregar_log_func(f"❌ Error de Sistema: {str(e)}", "danger")
