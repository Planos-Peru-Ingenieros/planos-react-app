import os
import time
import json
import calendar
from datetime import datetime, date
import sys
import tempfile
import traceback
from collections import defaultdict
import fitz
import requests
from requests.auth import HTTPDigestAuth
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import xlwings as xw
import api_model

# --- IMPORTACIONES NUEVAS PARA EL ROBOT ---
import threading 
from sunarp_scraper import consultar_estado_sunarp 
# ------------------------------------------

HOST = "127.0.0.1"
PORT = 5000

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_resource_path(relative_path):
    """Devuelve la ruta absoluta al recurso, funciona dentro y fuera de PyInstaller"""
    try:
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_path, relative_path)


# ==============================================================================
#  RUTAS DE COTIZACIONES
# ==============================================================================

@app.post("/crear-cotizacion")
async def crear_cotizacion(request: Request):
    """Crear cotización en Excel y devolverla como archivo adjunto"""
    try:
        data = await request.json()
        # cotizaciones retorna la ruta del archivo generado
        ruta_xlsx = cotizaciones(data)

        # Nombre de archivo para descargar
        codigo = data.get('codigo', 'cotizacion')
        nombre = data.get('usuario', 'usuario')
        hoy = datetime.now()
        anio = hoy.strftime("%Y")
        mes_dia = hoy.strftime("%m%d")
        abreviado_usuario = (nombre[:3] if nombre else 'USR').upper()
        nombre_archivo_excel = f"CZ-{anio}-{mes_dia}-{abreviado_usuario}-{codigo}.xlsx"
        return FileResponse(
            ruta_xlsx,
            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            filename=nombre_archivo_excel
        )
    except Exception as e:
        print(traceback.format_exc())
        return f'Error al procesar el formulario: {str(e)}', 500


@app.route('/crear-cotizacion-pdf', methods=['POST'])
async def crear_cotizacion_pdf(request: Request):
    try:
        data = await request.json()
        ruta_xlsx = cotizaciones(data)  # Genera el Excel temporal

        # Convertir Excel a PDF
        app_excel = xw.App(visible=False)
        libro = app_excel.books.open(ruta_xlsx)
        hoja = libro.sheets[0]
        ruta_pdf = ruta_xlsx.replace(".xlsx", ".pdf")
        hoja.to_pdf(ruta_pdf)
        libro.close()
        app_excel.quit()

        # Nombre de archivo para descargar
        codigo = data.get('codigo', 'cotizacion')
        nombre = data.get('usuario', 'usuario')
        hoy = datetime.now()
        anio = hoy.strftime("%Y")
        mes_dia = hoy.strftime("%m%d")
        abreviado_usuario = (nombre[:3] if nombre else 'USR').upper()
        nombre_archivo_pdf = f"CZ-{anio}-{mes_dia}-{abreviado_usuario}-{codigo}.pdf"

        return FileResponse(
            ruta_pdf,
            media_type='application/pdf',
            filename=nombre_archivo_pdf
        )
    except Exception as e:
        print(traceback.format_exc())
        return f'Ocurrió un error: {str(e)}', 500


@app.route('/crear-cotizacion-jpg', methods=['POST'])
async def crear_cotizacion_jpg(request: Request):
    try:
        # 1. Generar el Excel
        data = await request.json()
        ruta_xlsx = cotizaciones(data)

        # 2. Convertir Excel a PDF
        app_excel = xw.App(visible=False)
        libro = app_excel.books.open(ruta_xlsx)
        hoja = libro.sheets[0]
        ruta_pdf = ruta_xlsx.replace(".xlsx", ".pdf")
        hoja.to_pdf(ruta_pdf)
        libro.close()
        app_excel.quit()

        # 3. Convertir PDF a JPG
        doc = fitz.open(ruta_pdf)
        pagina = doc.load_page(0)  # Primera página
        pixmap = pagina.get_pixmap(dpi=300)
        ruta_jpg = ruta_pdf.replace(".pdf", ".jpg")
        pixmap.save(ruta_jpg)
        doc.close()

        # 4. Enviar el JPG
        codigo = data.get('codigo', 'cotizacion')
        nombre = data.get('usuario', 'usuario')
        hoy = datetime.now()
        anio = hoy.strftime("%Y")
        mes_dia = hoy.strftime("%m%d")
        abreviado_usuario = (nombre[:3] if nombre else 'USR').upper()
        file_name = f"CZ-{anio}-{mes_dia}-{abreviado_usuario}-{codigo}.jpg"

        return FileResponse(
            ruta_jpg,
            media_type='image/jpeg',
            filename=file_name
        )

    except Exception as e:
        print(traceback.format_exc())
        return f"Error al generar la cotización en JPG: {str(e)}", 500


def cotizaciones(data):
    """
    Edita el xlsx de cotizaciones a partir de un JSON.
    Recibe un diccionario con los datos y retorna la ruta del archivo Excel generado.
    """

    # --- 1. EXTRACCIÓN DE DATOS (NUEVO FORMATO) ---
    
    # Datos que ya usábamos (para nombre de archivo y plantilla)
    codigo = data.get('codigo')
    usuario = data.get('usuario') # Para el nombre del archivo

    # Datos del formulario (con los nombres nuevos del JSON)
    detalles = data.get('titulo', '') # En el JSON se llama 'titulo'
    cliente = data.get('cliente')
    ubicacion = data.get('ubicacion')
    telefono = data.get('telefono')
    dni = data.get('dni')
    observaciones = data.get('observaciones') or ' '
    pisos = data.get('pisos')
    area = data.get('area') # Ahora es un string (ej: "240 m2")
    cuotas_objetos = data.get('cuotas', [])

    # --- CAMPOS NUEVOS (extraídos del JSON) ---
    nombre_proyecto = data.get('nombre')
    tipo_id = data.get('tipo')
    elaboracion = data.get('elaboracion')
    estado = data.get('estado')

    # --- 2. APERTURA DE EXCEL ---
    ruta_original = get_resource_path(f'docs/{codigo}.xlsx')
    if not os.path.exists(ruta_original):
        raise FileNotFoundError(
            f'El archivo con el código "{codigo}" no se encuentra. (Ruta: {ruta_original})')

    app_excel = xw.App(visible=False)
    wb = app_excel.books.open(ruta_original)
    hoja = wb.sheets[0]

    # --- 3. LLENADO DE DATOS (Campos existentes) ---
    
    # Lógica de 'detalles' (partes)
    limites_detalles = [15, 100]
    partes = []
    texto_restante = detalles.strip()
    for limite in limites_detalles:
        if len(texto_restante) <= limite:
            partes.append(texto_restante)
            texto_restante = ''
        else:
            corte = texto_restante[:limite]
            espacio = corte.rfind(' ')
            if espacio != -1:
                partes.append(texto_restante[:espacio].strip())
                texto_restante = texto_restante[espacio + 1:].strip()
            else:
                partes.append(corte.strip())
                texto_restante = texto_restante[limite:].strip()
    if texto_restante:
        partes.append(texto_restante)

    # Llenar las celdas de detalles
    celdas_detalles = ['G11', 'B12', 'B13']
    for i in range(min(3, len(partes))):
        hoja.range(celdas_detalles[i]).value = partes[i]
        
    # Llenar datos del cliente/proyecto
    hoja.range('B15').value = cliente
    hoja.range('G15').value = ubicacion
    hoja.range('G16').value = telefono
    hoja.range('B17').value = dni
    hoja.range('B14').value = pisos
    hoja.range('D14').value = area # Escribe el string "240 m2"

    # Llenar observaciones
    for i, linea in enumerate(observaciones.split('\n'), start=52):
        if i > 54:
            break
        hoja.range(f'C{i}').value = linea

    # Llenar cuotas y fechas
    celdas_cuotas = ['C61', 'C62', 'C63', 'C64']
    celdas_fechas = ['G61', 'G62', 'G63', 'G64']
    
    for i, cuota_obj in enumerate(cuotas_objetos):
        if i >= len(celdas_cuotas):
            break
        monto = cuota_obj.get('monto')
        fecha = cuota_obj.get('fecha')
        hoja.range(celdas_cuotas[i]).value = monto
        hoja.range(celdas_fechas[i]).value = fecha

    # --- 4. LÓGICA DE GUARDADO ---
    hoy = datetime.now() 
    anio = hoy.strftime("%Y")
    mes_dia = hoy.strftime("%m%d")
    
    # Usamos la variable 'usuario' que viene del JSON
    abreviado_usuario = (usuario[:3] if usuario else 'USR').upper()

    def limpiar(texto):
        return ''.join(c for c in texto if c.isalnum() or c in (' ', '-', '_')).replace(' ', '')

    cliente_limpio = limpiar(cliente or 'Cliente')
    ubicacion_limpia = limpiar(ubicacion or 'Ubicacion')

    nombre_archivo = f"CZ-{anio}-{mes_dia}-{abreviado_usuario}-{codigo}-{cliente_limpio}-{ubicacion_limpia}.xlsx"
    hoja.range(
        'E19').value = f"CZ-{anio}-{mes_dia}-{abreviado_usuario}-{codigo}"

    # Crear archivo temporal Excel
    with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as temp_file:
        ruta_salida = temp_file.name

    wb.save(ruta_salida)
    wb.close()
    app_excel.quit()

    return ruta_salida

# ==============================================================================
#  RUTAS DE ASISTENCIA (HIKVISION)
# ==============================================================================

IP_TERMINAL = "192.168.18.101"
USUARIO = "admin"
PASSWORD = "Eunacin0@27"
URL_USER_SEARCH = f"http://{IP_TERMINAL}/ISAPI/AccessControl/UserInfo/Search?format=json"

AUTH = HTTPDigestAuth(USUARIO, PASSWORD)
HEADERS = {'Content-Type': 'application/json'}

# --- Payload para la búsqueda ---
# Le pedimos a la terminal todos los usuarios (máx 1000)
SEARCH_PAYLOAD = {
    "UserInfoSearchCond": {
        "searchID": "fastapi_search_1",  # ID de búsqueda aleatorio
        "searchResultPosition": 0,
        "maxResults": 1000
    }
}


@app.get("/api/users")
async def get_hikvision_users():
    """
    Obtiene la lista de usuarios registrados en la terminal Hikvision
    y la formatea para un CFormSelect.
    """
    try:
        # Hacemos la petición POST a la terminal
        response = requests.post(
            URL_USER_SEARCH,
            data=json.dumps(SEARCH_PAYLOAD),
            auth=AUTH,
            headers=HEADERS,
            timeout=10  # Timeout de 10 segundos
        )

        # Si la terminal responde con error (401, 404, 500), lanza una excepción
        response.raise_for_status()

        data = response.json()

        # --- Procesar la respuesta de Hikvision ---
        if (data.get("UserInfoSearch") and
            data["UserInfoSearch"].get("responseStatusStrg") == "OK" and
                "UserInfo" in data["UserInfoSearch"]):

            raw_user_list = data["UserInfoSearch"]["UserInfo"]
            formatted_users = []

            # Convertimos al formato { label, value }
            for user in raw_user_list:
                # Aseguramos que el usuario tenga nombre y ID
                if "name" in user and "employeeNo" in user:
                    formatted_users.append({
                        "label": user["name"],
                        "value": user["employeeNo"]  # ID de empleado
                    })

            # ¡Éxito! Devolvemos la lista formateada
            return formatted_users

        else:
            # La terminal respondió OK pero no devolvió datos
            raise HTTPException(
                status_code=404,
                detail=f"No se encontraron usuarios o la respuesta fue inesperada: {data}"
            )

    # --- Manejo de Errores ---
    except requests.exceptions.HTTPError as errh:
        # Error de autenticación (401) o endpoint no encontrado (404)
        raise HTTPException(
            status_code=errh.response.status_code,
            detail=f"Error HTTP de la terminal: {errh.response.text}"
        )
    except requests.exceptions.ConnectionError:
        # La terminal no es alcanzable (IP incorrecta, apagada, red)
        raise HTTPException(
            status_code=503,
            detail=f"Error de Conexión: No se pudo conectar a la terminal en {IP_TERMINAL}."
        )
    except requests.exceptions.Timeout:
        # La terminal tardó demasiado en responder
        raise HTTPException(
            status_code=504,
            detail="Error: Timeout. La terminal no respondió a tiempo."
        )
    except Exception as err:
        # Cualquier otro error
        raise HTTPException(
            status_code=500,
            detail=f"Ocurrió un error interno en el servidor: {err}"
        )


def get_terminal_data(id, comienzo, fin):
    url = "http://192.168.18.101/ISAPI/AccessControl/AcsEvent?format=json"
    headers = {'Content-Type': 'application/json'}
    auth = HTTPDigestAuth('admin', 'Eunacin0@27')

    search_result_position = 0
    all_events = []

    while True:
        payload = json.dumps({
            "AcsEventCond": {
                "searchID": "1",
                "searchResultPosition": search_result_position,
                "maxResults": 30,  # o 1000, pero la terminal puede tener límites
                "major": 5,
                "minor": 0,
                "employeeNoString": id,
                "startTime": comienzo,
                "endTime": fin
            }
        })

        response = requests.post(url, headers=headers,
                                 data=payload, auth=auth, timeout=10)

        if response.status_code != 200:
            print(f"Error en API: {response.status_code} - {response.text}")
            break

        data = response.json()
        acs_event = data.get("AcsEvent", {})
        info_list = acs_event.get("InfoList", [])

        for evento in info_list:
            time_iso = evento.get("time")
            if time_iso:
                dt = datetime.fromisoformat(time_iso)
                evento["time_formatted"] = dt.strftime("%H:%M")

        all_events.extend(info_list)

        total_matches = int(acs_event.get("totalMatches", 0))
        num_of_matches = int(acs_event.get("numOfMatches", 0))

        search_result_position += num_of_matches

        # Si ya alcanzaste el total, sales del bucle
        if search_result_position >= total_matches:
            break

    return all_events


def agrupar_eventos_por_dia(eventos, año, mes):
    # Construye dict: fecha → lista de horas
    dias = defaultdict(list)

    for evento in eventos:
        time_iso = evento.get("time")
        if time_iso:
            dt = datetime.fromisoformat(time_iso)
            fecha = dt.strftime("%Y-%m-%d")
            hora = dt.strftime("%H:%M")
            dias[fecha].append(hora)

    # Ordena cada lista de horas
    for fecha in dias:
        dias[fecha].sort()

    # Genera todas las fechas del mes
    total_dias = calendar.monthrange(int(año), int(mes))[1]
    fechas_del_mes = [
        datetime(int(año), int(mes), dia).strftime("%Y-%m-%d")
        for dia in range(1, total_dias + 1)
    ]

    # Construye lista final
    agrupados = []
    for fecha in fechas_del_mes:
        horas = dias.get(fecha, [])
        registro = {
            "fecha": fecha,
            "entrada": horas[0] if len(horas) >= 1 else "",
            "almuerzo": horas[1] if len(horas) >= 2 else "",
            "fin_almuerzo": horas[2] if len(horas) >= 3 else "",
            "salida": horas[3] if len(horas) >= 4 else ""
        }
        agrupados.append(registro)

    return agrupados


def dias_habiles_en_mes(año, mes):
    total_dias = calendar.monthrange(int(año), int(mes))[1]
    dias_habiles = 0
    for dia in range(1, total_dias + 1):
        dia_semana = date(int(año), int(mes), dia).weekday()
        if dia_semana < 5:  # Lunes=0, Viernes=4
            dias_habiles += 1
    return dias_habiles


@app.post("/asistencia")
async def generar_reporte_asistencia(data: api_model.AsistenciaRequest):
    """
    Recibe JSON, procesa y devuelve un archivo Excel.
    """

    id = data.userId
    if not id:
        raise HTTPException(
            status_code=404, detail=f"ID de usuario '{data.userId}' no encontrado.")

    mes_str = str(data.month).zfill(2)
    año_str = str(data.year)

    _, ultimo_dia = calendar.monthrange(data.year, data.month)

    comienzo = f"{año_str}-{mes_str}-01T00:00:00-05:00"
    fin = f"{año_str}-{mes_str}-{ultimo_dia}T23:59:59-05:00"

    # 2. Ejecutar Lógica de Negocio
    print(f"Generando reporte para {id}, {mes_str}/{año_str}...")
    event_data = get_terminal_data(id, comienzo, fin)
    eventos_agrupados = agrupar_eventos_por_dia(event_data, año_str, mes_str)
    dias_habiles = dias_habiles_en_mes(año_str, mes_str)

    # 3. Generar Excel (con manejo de errores)
    output_dir = "docs"
    os.makedirs(output_dir, exist_ok=True)  # Asegura que 'docs' exista
    ruta_excel = get_resource_path(os.path.join("docs", "reporte.xlsm"))
    ruta_salida = get_resource_path(os.path.join(
        "docs", f"reporte_{id}_{año_str}_{mes_str}.xlsm"))

    if not os.path.exists(ruta_excel):
        raise HTTPException(
            status_code=500, detail=f"No se encontró la plantilla 'reporte.xlsm' en la carpeta 'docs'")

    app_xw = None
    try:
        app_xw = xw.App(visible=False)
        wb = app_xw.books.open(ruta_excel)
        ws = wb.sheets["Reporte de Asistencia"]

        ws.range("F7").value = dias_habiles

        fila_inicio = 19
        for i, evento in enumerate(eventos_agrupados):
            fila = fila_inicio + i
            ws.range(f"C{fila}").value = evento["fecha"]
            ws.range(f"D{fila}").value = evento["entrada"]
            ws.range(f"E{fila}").value = evento["almuerzo"]
            ws.range(f"F{fila}").value = evento["fin_almuerzo"]
            ws.range(f"G{fila}").value = evento["salida"]
            if evento["fecha"]:
                dia_semana = datetime.strptime(
                    evento["fecha"], "%Y-%m-%d").weekday()
                if dia_semana in [0, 1, 2, 3, 4]:
                    formula = '=IF([@ENTRADA]>G$7,F$10-E$10-[@ENTRADA],IF([@SALIDA]<F$10,[@SALIDA]-E$10-D$10,G$10))'
                    ws.range(f"H{fila}").formula = formula
                else:
                    ws.range(f"H{fila}").value = ""
            else:
                ws.range(f"H{fila}").value = ""

        wb.save(ruta_salida)

    except Exception as e:
        print(f"Error al escribir el Excel: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error al generar el archivo Excel: {e}")
    finally:
        # Asegurarse de que Excel se cierre siempre
        if app_xw:
            wb.close()
            app_xw.quit()

    # 4. Devolver el archivo
    print(f"Reporte generado: {ruta_salida}")
    return FileResponse(
        path=ruta_salida,
        filename=os.path.basename(ruta_salida),
        media_type="application/vnd.ms-excel.sheet.macroEnabled.12",
        headers={
            "Content-Disposition": f'attachment; filename="{os.path.basename(ruta_salida)}"'}
    )


@app.get("/hello/{name}")
def read_root(name: str):
    return f"hello {name}"


@app.post("/open-explorer/")
def open_explorer(model: api_model.PathModel):

    os.startfile(model.path)

    return f"Opening {model.path}"

# ==============================================================================
#  LÓGICA DEL ROBOT EN SEGUNDO PLANO (INTEGRADO EN FASTAPI)
# ==============================================================================

# URL DE TU SERVIDOR DJANGO (Donde están los expedientes)
URL_DJANGO_CPANEL = "http://127.0.0.1:8000"  # <--- AJUSTA ESTO A TU DOMINIO REAL SI USAS CPANEL

# Variables de control
robot_activo = False
hilo_robot = None

def proceso_robot_background():
    """
    Esta función corre en paralelo. Revisa pendientes y ejecuta el scraper.
    """
    global robot_activo
    print("🤖 Robot iniciado en segundo plano...")
    
    while robot_activo:
        try:
            # 1. PEDIR TRABAJO A DJANGO
            # Asegúrate que la URL coincida con tus rutas de Django
            url_pendientes = f"{URL_DJANGO_CPANEL}/api/robot/pendientes/"
            
            try:
                resp = requests.get(url_pendientes, timeout=10)
            except Exception as e:
                print(f"⚠️ Error conectando con Django: {e}")
                time.sleep(10)
                continue

            if resp.status_code == 200:
                data = resp.json()
                tareas = data.get("tareas", [])
                
                if not tareas:
                    print("💤 Nada pendiente. Esperando...")
                    # Espera con chequeo de apagado
                    for _ in range(30): 
                        if not robot_activo: break
                        time.sleep(1)
                    continue

                # 2. PROCESAR TAREAS
                for tarea in tareas:
                    if not robot_activo: break # Apagado de emergencia

                    titulo = tarea['titulo']
                    anio = tarea['anio']
                    oficina = tarea['oficina']
                    id_exp = tarea['id']

                    print(f"🚀 Procesando: {titulo} - {anio}")
                    
                    # --- EJECUTAR SCRAPER (Se abrirá ventana) ---
                    nuevo_estado = consultar_estado_sunarp(anio, titulo, oficina)
                    # --------------------------------------------

                    if nuevo_estado and "Error" not in nuevo_estado:
                        # 3. ENVIAR A DJANGO
                        url_guardar = f"{URL_DJANGO_CPANEL}/api/robot/guardar/"
                        try:
                            requests.post(url_guardar, json={
                                "id": id_exp,
                                "estado": nuevo_estado
                            })
                            print(f"   ✅ Guardado: {nuevo_estado}")
                        except:
                            print("   ❌ Error enviando resultado")
                    
                    time.sleep(5) # Descanso entre consultas

            else:
                print(f"Error API Django: {resp.status_code}")
                time.sleep(10)

        except Exception as e:
            print(f"Error en bucle robot: {e}")
            time.sleep(10)
    
    print("🛑 Robot detenido.")

# ==============================================================================
#  ENDPOINTS DE CONTROL DEL ROBOT
# ==============================================================================

@app.post("/api/robot/start")
async def start_robot():
    global robot_activo, hilo_robot
    
    if not robot_activo:
        robot_activo = True
        # Creamos el hilo y lo iniciamos
        hilo_robot = threading.Thread(target=proceso_robot_background)
        hilo_robot.daemon = True # Se cierra si cierras la app principal
        hilo_robot.start()
        return {"status": "started", "message": "Robot iniciado correctamente"}
    else:
        return {"status": "running", "message": "El robot ya está corriendo"}

@app.post("/api/robot/stop")
async def stop_robot():
    global robot_activo
    if robot_activo:
        robot_activo = False
        return {"status": "stopping", "message": "Deteniendo robot (espere a que termine la tarea actual)..."}
    else:
        return {"status": "stopped", "message": "El robot ya estaba detenido"}

@app.get("/api/robot/status")
async def status_robot():
    """Devuelve si el robot está prendido o apagado"""
    return {"active": robot_activo}


# ==============================================================================
#  ARRANQUE DEL SERVIDOR
# ==============================================================================

if __name__ == "__main__":
    import asyncio
    import uvicorn

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    loop.run_until_complete(uvicorn.run(
        app, host=HOST, port=PORT, log_level="debug"))