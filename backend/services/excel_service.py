import os
import tempfile
import traceback
import io  # <--- Nuevo: Para manejar el archivo en memoria
from datetime import datetime
import xlwings as xw
import fitz  # PyMuPDF
from openpyxl import load_workbook # <--- Nuevo: Para editar el Formulario Registral
from utils import get_resource_path

# ==============================================================================
#  LÓGICA DE COTIZACIONES (Tu código original con xlwings)
# ==============================================================================

def generar_excel_cotizacion(data):
    """
    Lógica principal para llenar la plantilla de cotización.
    Retorna la ruta del archivo temporal generado.
    """
    codigo = data.get('codigo')
    usuario = data.get('usuario')
    detalles = data.get('titulo', '')
    cliente = data.get('cliente')
    ubicacion = data.get('ubicacion')
    telefono = data.get('telefono')
    dni = data.get('dni')
    observaciones = data.get('observaciones') or ' '
    pisos = data.get('pisos')
    area = data.get('area')
    cuotas_objetos = data.get('cuotas', [])

    ruta_original = get_resource_path(f'docs/{codigo}.xlsx')
    
    if not os.path.exists(ruta_original):
        raise FileNotFoundError(f'El archivo "{codigo}" no existe en: {ruta_original}')

    app_excel = xw.App(visible=False)
    try:
        wb = app_excel.books.open(ruta_original)
        hoja = wb.sheets[0]

        # --- Lógica de desglose de texto (Detalles) ---
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

        celdas_detalles = ['G11', 'B12', 'B13']
        for i in range(min(3, len(partes))):
            hoja.range(celdas_detalles[i]).value = partes[i]

        # --- Llenado de campos simples ---
        hoja.range('B15').value = cliente
        hoja.range('G15').value = ubicacion
        hoja.range('G16').value = telefono
        hoja.range('B17').value = dni
        hoja.range('B14').value = pisos
        hoja.range('D14').value = area

        # --- Observaciones ---
        for i, linea in enumerate(observaciones.split('\n'), start=52):
            if i > 54: break
            hoja.range(f'C{i}').value = linea

        # --- Cuotas ---
        celdas_cuotas = ['C61', 'C62', 'C63', 'C64']
        celdas_fechas = ['G61', 'G62', 'G63', 'G64']
        for i, cuota_obj in enumerate(cuotas_objetos):
            if i >= len(celdas_cuotas): break
            hoja.range(celdas_cuotas[i]).value = cuota_obj.get('monto')
            hoja.range(celdas_fechas[i]).value = cuota_obj.get('fecha')

        # --- Guardado ---
        hoy = datetime.now()
        anio = hoy.strftime("%Y")
        mes_dia = hoy.strftime("%m%d")
        abreviado_usuario = (usuario[:3] if usuario else 'USR').upper()
        
        hoja.range('E19').value = f"CZ-{anio}-{mes_dia}-{abreviado_usuario}-{codigo}"

        with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as temp_file:
            ruta_salida = temp_file.name

        wb.save(ruta_salida)
        wb.close()
        return ruta_salida
    except Exception as e:
        # Asegurar que Excel se cierre si hay error
        if 'wb' in locals(): wb.close()
        raise e
    finally:
        app_excel.quit()

def convertir_xlsx_a_pdf(ruta_xlsx):
    """Convierte un Excel dado a PDF y retorna la ruta del PDF"""
    app_excel = xw.App(visible=False)
    try:
        libro = app_excel.books.open(ruta_xlsx)
        hoja = libro.sheets[0]
        ruta_pdf = ruta_xlsx.replace(".xlsx", ".pdf")
        hoja.to_pdf(ruta_pdf)
        libro.close()
        return ruta_pdf
    finally:
        app_excel.quit()

def convertir_pdf_a_jpg(ruta_pdf):
    """Convierte la primera página de un PDF a JPG"""
    doc = fitz.open(ruta_pdf)
    pagina = doc.load_page(0)
    pixmap = pagina.get_pixmap(dpi=300)
    ruta_jpg = ruta_pdf.replace(".pdf", ".jpg")
    pixmap.save(ruta_jpg)
    doc.close()
    return ruta_jpg

# ==============================================================================
#  NUEVA LÓGICA: FORMULARIO REGISTRAL (Usando openpyxl y hoja "DATOS")
# ==============================================================================

# ==============================================================================
#  NUEVA LÓGICA: FORMULARIO REGISTRAL (Usando xlwings para macros)
# ==============================================================================
def generar_excel_formulario_registral(data):
    """
    Rellena el Formulario Registral usando xlwings para preservar las macros.
    Retorna un objeto BytesIO (archivo en memoria).
    """
    ruta_plantilla = get_resource_path('docs/Formulario1.1.1..xltm')
    
    if not os.path.exists(ruta_plantilla):
        raise FileNotFoundError(f'No se encuentra la plantilla en: {ruta_plantilla}')

    # Iniciar Excel y abrir la plantilla
    app_excel = xw.App(visible=False)
    try:
        # Abrimos la plantilla
        wb = app_excel.books.open(ruta_plantilla)
        
        # Seleccionamos la hoja DATOS
        if 'DATOS' not in [s.name for s in wb.sheets]:
             raise ValueError("La plantilla no tiene una hoja llamada 'DATOS'")
             
        ws = wb.sheets['DATOS']

        # --- Llenado de Campos Simples ---
        # *** DEBES VERIFICAR ESTAS CELDAS EN TU ARCHIVO REAL ***
        ws.range('A10').value = data.get('apellidos', '')      # Apellidos
        ws.range('B10').value = data.get('nombres', '')        # Nombres
        ws.range('C10').value = data.get('dni', '')            # DNI
        ws.range('D10').value = data.get('estado_civil', '')   # Estado Civil
        ws.range('E10').value = data.get('domicilio', '')      # Domicilio

        # --- Llenado de Lista Larga (Ej: Fila 20 en adelante) ---
        lista_items = data.get('lista_datos', []) 
        fila_inicio = 20 
        
        for i, item in enumerate(lista_items):
            fila_actual = fila_inicio + i
            # Ajusta las columnas A, B, C según corresponda en tu hoja DATOS
            ws.range(f'A{fila_actual}').value = item.get('columna1', '') 
            ws.range(f'B{fila_actual}').value = item.get('columna2', '')

        # Guardar en un archivo temporal en disco (necesario para xlwings)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsm") as temp_file:
            ruta_salida = temp_file.name

        # Guardamos el archivo con el formato .xlsm (macro)
        wb.save(ruta_salida)
        wb.close()
        
        # Leemos el archivo guardado en disco a un objeto en memoria (BytesIO)
        # Esto es lo que FastAPI necesita para enviarlo
        with open(ruta_salida, 'rb') as f:
            output = io.BytesIO(f.read())
        
        # Limpiar el archivo temporal del disco
        os.unlink(ruta_salida)

        return output
        
    except Exception as e:
        if 'wb' in locals(): wb.close()
        raise e
    finally:
        app_excel.quit()