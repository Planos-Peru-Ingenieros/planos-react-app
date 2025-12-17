import threading
import time
import requests
import sys
import os

# CONFIGURACIÓN DE RUTA PARA EL SCRAPER
# Detectamos la ruta real del archivo para evitar errores de "not defined"
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

def importar_scraper():
    try:
        # Intento 1: Importación como módulo de paquete (Desarrollo)
        from . import sunarp_scraper
        return sunarp_scraper.consultar_estado_sunarp
    except (ImportError, ValueError):
        try:
            # Intento 2: Importación directa (Producción/EXE)
            import sunarp_scraper
            return sunarp_scraper.consultar_estado_sunarp
        except ImportError:
            # Si falla, lanzamos un error claro en el log de la App
            return None

# Definimos la función globalmente para que el hilo la reconozca
consultar_estado_sunarp = importar_scraper()
stop_event = threading.Event()

def iniciar_agente_hilo(agregar_log_func):
    global stop_event
    stop_event.clear()
    
    if consultar_estado_sunarp is None:
        agregar_log_func("❌ Error Crítico: No se encontró sunarp_scraper.py", "danger")
        return

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
                
                ot = tarea.get('ot') or tarea.get('id')
                titulo = tarea['titulo']
                anio = tarea['anio']
                oficina = tarea.get('oficina', 'LIMA').upper()
                estado_previo = tarea.get('estado', 'Pendiente')

                agregar_log_func(f"🚀 Procesando OT: {ot} | Título: {titulo}", "info")
                
                # LLAMADA AL SCRAPER
                nuevo_estado = consultar_estado_sunarp(anio, titulo, oficina)

                if nuevo_estado and "Error" not in nuevo_estado:
                    detalle = f"OT: {ot} | {titulo} ({anio}) -> CAMBIO: [{estado_previo}] a [{nuevo_estado.upper()}]"
                    agregar_log_func(detalle, "success")
                    requests.post(f"{URL_BASE}/api/robot/guardar/", json={"id": tarea['id'], "estado": nuevo_estado})
                else:
                    agregar_log_func(f"⚠️ OT: {ot} | Falló consulta Sunarp.", "danger")
                
                time.sleep(3)
        else:
            agregar_log_func(f"❌ Error API: {resp.status_code}", "danger")
    except Exception as e:
        agregar_log_func(f"❌ Error de Sistema: {str(e)}", "danger")