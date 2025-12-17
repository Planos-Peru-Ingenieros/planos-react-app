import time
import requests
import sys
import os

# IMPORTANTE: Usamos importación relativa (.) porque estamos dentro de un paquete
try:
    from .sunarp_scraper import consultar_estado_sunarp
except ImportError:
    # Si se ejecuta por fuera de FastAPI para pruebas
    try:
        from sunarp_scraper import consultar_estado_sunarp
    except ImportError:
        print("[ERROR] No se encuentra 'sunarp_scraper.py'. Verifique las rutas.")
        sys.exit()

# CONFIGURACIÓN
URL_BASE = "https://www.planosperu.com.pe/intranet/"

def iniciar_agente_hilo():
    """
    Versión del agente adaptada para correr como un hilo (thread) de FastAPI.
    Se eliminaron emojis para evitar errores de codificación en consolas Windows.
    """
    print("==========================================")
    print(" AGENTE DE ESCRITORIO - SUNARP")
    print(f" Conectado a: {URL_BASE}")
    print("==========================================\n")

    while True:
        try:
            print(f"[{time.strftime('%H:%M:%S')}] Consultando tareas pendientes...")
            
            url_pendientes = f"{URL_BASE}/api/robot/pendientes/"
            
            try:
                resp = requests.get(url_pendientes, timeout=10)
            except requests.exceptions.ConnectionError:
                print("[ERROR] No se puede conectar al servidor Django.")
                time.sleep(10)
                continue

            if resp.status_code == 200:
                data = resp.json()
                tareas = data.get("tareas", [])
                
                if not tareas:
                    print(" --- Nada pendiente. Esperando 30 segundos...")
                    time.sleep(30)
                    continue
                
                print(f" --- [OK] Se encontraron {len(tareas)} expedientes.")

                for tarea in tareas:
                    titulo = tarea['titulo']
                    anio = tarea['anio']
                    oficina = tarea['oficina']
                    id_exp = tarea['id']

                    if not anio or not titulo:
                        print(f" --- [!] Datos incompletos para ID {id_exp}, saltando.")
                        continue

                    print(f"\n >>> Trabajando en: {titulo} - {anio} ({oficina})...")
                    
                    # Ejecución del Robot Selenium
                    nuevo_estado = consultar_estado_sunarp(anio, titulo, oficina)

                    if nuevo_estado and "Error" not in nuevo_estado:
                        print(f"      -> Estado obtenido: {nuevo_estado}")
                        
                        url_guardar = f"{URL_BASE}/api/robot/guardar/"
                        payload = {
                            "id": id_exp,
                            "estado": nuevo_estado
                        }
                        
                        res_post = requests.post(url_guardar, json=payload)
                        
                        if res_post.status_code == 200:
                            print("      -> [OK] Guardado correctamente en la web.")
                        else:
                            print(f"      -> [ERROR] Guardando en web: {res_post.text}")
                    else:
                        print(f"      -> [!] Falló la consulta en Sunarp: {nuevo_estado}")
                    
                    time.sleep(5)

            elif resp.status_code == 404:
                print(f"[ERROR 404] No se encuentra la ruta: {url_pendientes}")
                time.sleep(20)
            else:
                print(f"[ERROR] Servidor respondió con: {resp.status_code}")

        except Exception as e:
            print(f"[ERROR CRITICO] {e}")
            time.sleep(10)

if __name__ == "__main__":
    iniciar_agente_hilo()