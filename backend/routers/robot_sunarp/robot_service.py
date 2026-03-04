import sys
import os
import threading
import time
from datetime import datetime
import requests
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

    # URL LOCAL (Para tus pruebas)
    # URL_BASE = "http://127.0.0.1:8000"
    URL_BASE = "https://intranet.planosperu.com.pe"

    logs_importantes = []
    logs_relleno = []

    # Wrapper inteligente para clasificar logs
    def log_interno(mensaje, tipo, es_importante=True):
        hora_actual = datetime.now().strftime("%H:%M:%S")
        log_obj = {
            "hora": hora_actual,
            "mensaje": mensaje,
            "tipo": tipo
        }

        if es_importante:
            logs_importantes.append(log_obj)
        else:
            logs_relleno.append(log_obj)

        agregar_log_func(mensaje, tipo)

    try:
        # Mensajes de sistema siempre son importantes
        log_interno("Buscando expedientes en Intranet...",
                    "info", es_importante=True)

        resp = requests.get(f"{URL_BASE}/api/robot/pendientes/", timeout=10)

        if resp.status_code == 200:
            tareas = resp.json().get("tareas", [])

            if not tareas:
                log_interno("💤 Sin títulos pendientes.", "info")
                enviar_email_final(URL_BASE, logs_importantes)
                return

            for tarea in tareas:
                if stop_event.is_set():
                    log_interno("⏹️ PROCESO INTERRUMPIDO.", "danger")
                    break

                ot_visible = tarea.get('ot_id', 'N/A')
                titulo = tarea['titulo']
                anio = tarea['anio']
                oficina = tarea.get('oficina', 'LIMA').upper()
                estado_previo = str(tarea.get('estado', '')).strip().upper()

                agregar_log_func(f"🚀 Procesando OT: {ot_visible}...", "info")
                resultado = consultar_estado_sunarp(anio, titulo, oficina)
                nuevo_estado_raw = resultado.get("estado", "Error")
                fecha_vencimiento = resultado.get("vencimiento", "")
                presentante = resultado.get("presentante", "")

                if nuevo_estado_raw and "Error" not in nuevo_estado_raw:
                    nuevo_estado = nuevo_estado_raw.strip().upper()
                    if nuevo_estado == "EN CALIFICACION":
                        nuevo_estado = "EN CALIFICACIÓN"
                    if nuevo_estado == estado_previo:
                        detalle = f"OT: {ot_visible} ({titulo}) -> Sigue en {nuevo_estado} (Vence: {fecha_vencimiento})"
                        log_interno(detalle, "info", es_importante=False)
                    else:
                        detalle = f"OT: {ot_visible} ({titulo}) -> CAMBIÓ A: {nuevo_estado} (Vence: {fecha_vencimiento})"
                        log_interno(detalle, "success", es_importante=True)
                    try:
                        requests.post(f"{URL_BASE}/api/robot/guardar/",
                                      json={
                                          "id": tarea['id'],
                                          "estado": nuevo_estado,
                                          "vencimiento": fecha_vencimiento,
                                          "presentante": presentante
                        }, timeout=10)
                    except Exception as e:
                        print(f"Error enviando datos al backend: {e}")

                else:
                    # ERROR EN SCRAPER
                    log_interno(
                        f"⚠️ OT: {ot_visible} | Falló consulta Sunarp.", "danger", es_importante=True)

                time.sleep(5)

            log_interno(
                "🏁 Proceso finalizado. Enviando reporte ordenado...", "info")

            logs_ordenados = logs_importantes + logs_relleno
            enviar_email_final(URL_BASE, logs_ordenados)

        else:
            log_interno(
                f"❌ Error API Pendientes: {resp.status_code}", "danger")
            enviar_email_final(URL_BASE, logs_importantes)

    except Exception as e:
        log_interno(f"❌ Error Crítico Robot: {str(e)}", "danger")
        enviar_email_final(URL_BASE, logs_importantes)


def enviar_email_final(url_base, logs):
    """Envía los logs al backend de Django para reporte o email"""
    try:
        url_reporte = f"{url_base}/api/robot/enviar-reporte/"
        requests.post(url_reporte, json={"logs": logs}, timeout=10)
        print(">> Reporte enviado al servidor Django.")
    except Exception as e:
        print(f">> Error enviando reporte final: {e}")
