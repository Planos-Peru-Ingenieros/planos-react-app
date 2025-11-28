import json
import calendar
import requests
import os
import time  # <--- IMPORTANTE: Agregado para la pausa de seguridad
from datetime import datetime, date
from collections import defaultdict
from fastapi import HTTPException
import xlwings as xw

from ..config import HK_URL_SEARCH, HK_URL_EVENTS, HK_AUTH
from ..utils import get_resource_path

HEADERS = {'Content-Type': 'application/json'}

def obtener_usuarios_terminal():
    payload = {
        "UserInfoSearchCond": {
            "searchID": "fastapi_search_1",
            "searchResultPosition": 0,
            "maxResults": 1000
        }
    }
    try:
        response = requests.post(HK_URL_SEARCH, data=json.dumps(payload), auth=HK_AUTH, headers=HEADERS, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if (data.get("UserInfoSearch") and data["UserInfoSearch"].get("responseStatusStrg") == "OK" and "UserInfo" in data["UserInfoSearch"]):
            raw_user_list = data["UserInfoSearch"]["UserInfo"]
            formatted_users = []
            for user in raw_user_list:
                if "name" in user and "employeeNo" in user:
                    formatted_users.append({
                        "label": user["name"],
                        "value": user["employeeNo"]
                    })
            return formatted_users
        else:
            raise HTTPException(status_code=404, detail="No se encontraron usuarios o respuesta inesperada.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def obtener_eventos_raw(id_empleado, inicio, fin):
    search_result_position = 0
    all_events = []
    
    while True:
        payload = json.dumps({
            "AcsEventCond": {
                "searchID": "1",
                "searchResultPosition": search_result_position,
                "maxResults": 30,
                "major": 5,
                "minor": 0,
                "employeeNoString": id_empleado,
                "startTime": inicio,
                "endTime": fin
            }
        })
        
        try:
            response = requests.post(HK_URL_EVENTS, headers=HEADERS, data=payload, auth=HK_AUTH, timeout=10)
            if response.status_code != 200: break
            
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
            
            if search_result_position >= total_matches: break
        except Exception:
            break
            
    return all_events

def procesar_reporte_excel(user_id, year, month):
    # 1. Preparar fechas
    mes_str = str(month).zfill(2)
    año_str = str(year)
    _, ultimo_dia = calendar.monthrange(year, month)
    comienzo = f"{año_str}-{mes_str}-01T00:00:00-05:00"
    fin = f"{año_str}-{mes_str}-{ultimo_dia}T23:59:59-05:00"

    # 2. Obtener datos
    raw_events = obtener_eventos_raw(user_id, comienzo, fin)
    
    # 3. Agrupar (Lógica interna)
    dias = defaultdict(list)
    for evento in raw_events:
        dt = datetime.fromisoformat(evento.get("time"))
        fecha = dt.strftime("%Y-%m-%d")
        hora = dt.strftime("%H:%M")
        dias[fecha].append(hora)
    
    for fecha in dias: dias[fecha].sort()

    total_dias_mes = calendar.monthrange(year, month)[1]
    fechas_del_mes = [datetime(year, month, dia).strftime("%Y-%m-%d") for dia in range(1, total_dias_mes + 1)]
    
    agrupados = []
    for fecha in fechas_del_mes:
        horas = dias.get(fecha, [])
        agrupados.append({
            "fecha": fecha,
            "entrada": horas[0] if len(horas) >= 1 else "",
            "almuerzo": horas[1] if len(horas) >= 2 else "",
            "fin_almuerzo": horas[2] if len(horas) >= 3 else "",
            "salida": horas[3] if len(horas) >= 4 else ""
        })

    # 4. Calcular días hábiles
    dias_habiles = sum(1 for dia in range(1, total_dias_mes + 1) if date(year, month, dia).weekday() < 5)

    # 5. Generar Excel
    output_dir = "docs"
    os.makedirs(output_dir, exist_ok=True)
    ruta_plantilla = get_resource_path(os.path.join("docs", "reporte.xlsm"))
    ruta_salida = get_resource_path(os.path.join("docs", f"reporte_{user_id}_{año_str}_{mes_str}.xlsm"))

    if not os.path.exists(ruta_plantilla):
        raise HTTPException(status_code=500, detail="Plantilla reporte.xlsm no encontrada")

    # --- INICIO BLOQUE CORREGIDO ---
    app_xw = xw.App(visible=False)
    wb = None  # Inicializamos la variable wb
    try:
        wb = app_xw.books.open(ruta_plantilla)
        ws = wb.sheets["Reporte de Asistencia"]
        ws.range("F7").value = dias_habiles
        
        fila_inicio = 19
        for i, evento in enumerate(agrupados):
            fila = fila_inicio + i
            ws.range(f"C{fila}").value = evento["fecha"]
            ws.range(f"D{fila}").value = evento["entrada"]
            ws.range(f"E{fila}").value = evento["almuerzo"]
            ws.range(f"F{fila}").value = evento["fin_almuerzo"]
            ws.range(f"G{fila}").value = evento["salida"]
            
            if evento["fecha"]:
                dia_semana = datetime.strptime(evento["fecha"], "%Y-%m-%d").weekday()
                if dia_semana < 5: # Lunes a Viernes
                    ws.range(f"H{fila}").formula = '=IF([@ENTRADA]>G$7,F$10-E$10-[@ENTRADA],IF([@SALIDA]<F$10,[@SALIDA]-E$10-D$10,G$10))'
                else:
                    ws.range(f"H{fila}").value = ""
            else:
                ws.range(f"H{fila}").value = ""
                
        # GUARDAR Y CERRAR EXPLICITAMENTE ANTES DEL RETURN
        wb.save(ruta_salida)
        wb.close()
        app_xw.quit()

        # Pequeña pausa para que Windows libere el archivo completamente
        time.sleep(0.5)

        return ruta_salida

    except Exception as e:
        # En caso de error, intentamos cerrar todo a la fuerza
        try:
            if wb: wb.close()
        except:
            pass
        app_xw.quit()
        raise e