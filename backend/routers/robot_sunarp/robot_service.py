import threading
import time
import requests
try:
    from .sunarp_scraper import consultar_estado_sunarp
except ImportError:
    from sunarp_scraper import consultar_estado_sunarp

stop_event = threading.Event()

def iniciar_agente_hilo(agregar_log_func):
    global stop_event
    stop_event.clear()
    
    URL_BASE = "https://www.planosperu.com.pe/intranet/"
    
    try:
        agregar_log_func("Conectando con Intranet para buscar pendientes...", "info")
        
        resp = requests.get(f"{URL_BASE}/api/robot/pendientes/", timeout=10)
        
        if resp.status_code == 200:
            tareas = resp.json().get("tareas", [])
            if not tareas:
                agregar_log_func("💤 No hay expedientes pendientes por actualizar.", "info")
                return

            agregar_log_func(f"✅ Se encontraron {len(tareas)} expedientes.", "success")

            for tarea in tareas:
                if stop_event.is_set():
                    agregar_log_func("⏹️ PROCESO DETENIDO: Cerrando recursos...", "danger")
                    break
                
                ot = tarea.get('ot') or tarea.get('id')
                titulo = tarea['titulo']
                anio = tarea['anio']
                oficina = tarea.get('oficina', 'LIMA').upper() 
                estado_previo = tarea.get('estado', 'Pendiente')

                agregar_log_func(f"🚀 Procesando OT: {ot} | Oficina: {oficina} | Título: {titulo}", "info")
                
                nuevo_estado = consultar_estado_sunarp(anio, titulo, oficina)

                if nuevo_estado and "Error" not in nuevo_estado:
                    detalle = f"OT: {ot} | {titulo} ({anio}) -> CAMBIO: [{estado_previo}] a [{nuevo_estado}]"
                    agregar_log_func(detalle, "success")
                    
                    try:
                        res_web = requests.post(
                            f"{URL_BASE}/api/robot/guardar/", 
                            json={"id": tarea['id'], "estado": nuevo_estado},
                            timeout=10
                        )
                        if res_web.status_code == 200:
                            agregar_log_func(f"🌐 OT: {ot} sincronizada con éxito en la web.", "info")
                    except:
                        agregar_log_func(f"❌ Error al conectar con la Intranet para guardar OT: {ot}", "danger")
                else:
                    agregar_log_func(f"⚠️ OT: {ot} | No se pudo obtener el estado (Sunarp error).", "danger")
                
                time.sleep(3)
            
            if not stop_event.is_set():
                agregar_log_func("🏁 BARRIDO COMPLETO: El robot terminó su trabajo.", "success")
        else:
            agregar_log_func(f"❌ Error de servidor Django: {resp.status_code}", "danger")

    except Exception as e:
        agregar_log_func(f"❌ ERROR CRÍTICO: {str(e)}", "danger")