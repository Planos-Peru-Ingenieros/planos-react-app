import os
import sys
import threading
import time
from datetime import datetime

import requests

from .sunarp_scraper import consultar_estado_sunarp

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)


stop_event = threading.Event()


def iniciar_agente_hilo(agregar_log_func):
    global stop_event
    stop_event.clear()

    # URL_BASE = "http://127.0.0.1:8000"
    URL_BASE = "https://intranet.planosperu.com.pe"
    AUTH_TOKEN = "6dd3482aacd442cc7e0632a381c9f7ec3d1f8389"
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
        resp = requests.get(f"{URL_BASE}/api/sunarp/pendientes/",
                            timeout=10, headers={"Authorization": f"Token {AUTH_TOKEN}"})

        if resp.status_code == 200:
            expedientes = resp.json()

            for exp in expedientes:
                if stop_event.is_set():
                    log_interno("⏹️ PROCESO INTERRUMPIDO.", "danger")
                    break

                ot_visible = exp.get('ot', 'N/A')
                titulo = exp.get('numero', 'N/A')
                anio = exp.get('anio', 'N/A')
                oficina = exp.get('oficina', 'LIMA').upper()

                agregar_log_func(f"🚀 Procesando OT: {ot_visible}...", "info")

                # Llamada al scraper
                resultado = consultar_estado_sunarp(anio, titulo, oficina)

                # 1. Validar si el scraper devolvió un None (error inesperado)
                if resultado is None:
                    log_interno(
                        f"❌ Error al consultar OT {ot_visible}. No se obtuvo resultado de la web.", "danger")
                    continue

                # 2. Validar si el scraper devolvió nuestro JSON de error personalizado
                if isinstance(resultado, dict) and "error" in resultado:
                    tipo_error = resultado.get("error")
                    mensaje_error = resultado.get("mensaje")
                    # Imprimimos el error exacto que capturó el scraper (Chrome, Intentos, etc.)
                    log_interno(
                        f"❌ Error en OT {ot_visible} [{tipo_error}]: {mensaje_error}", "danger")
                    continue

                # 3. Si todo está correcto, actualizar en la intranet
                try:
                    patch_resp = requests.patch(
                        f"{URL_BASE}/api/sunarp/{exp['id']}/update-sunarp/",
                        json=resultado,
                        timeout=10,
                        headers={"Authorization": f"Token {AUTH_TOKEN}"}
                    )
                    if patch_resp.status_code in [200, 201]:
                        log_interno(
                            f"✅ OT {ot_visible} actualizada correctamente.", "success", es_importante=False)
                    else:
                        log_interno(
                            f"⚠️ Error al actualizar OT {ot_visible} en backend. Status: {patch_resp.status_code}", "warning")
                except Exception as e:
                    log_interno(
                        f"❌ Error de red enviando OT {ot_visible} al backend: {str(e)}", "danger")

                time.sleep(5)

            log_interno(
                "🏁 Proceso finalizado. El robot ha terminado su cola de tareas.", "info")

        else:
            log_interno(
                f"❌ Error API Pendientes: No se pudo conectar a la intranet (HTTP {resp.status_code})", "danger")

    except Exception as e:
        log_interno(f"❌ Error Crítico Robot: {str(e)}", "danger")
