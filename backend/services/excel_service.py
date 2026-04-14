import os
import tempfile
import textwrap
from datetime import datetime
import xlwings as xw
import fitz
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
    titulos = data.get('titulos', '-')
    cuotas_objetos = data.get('cuotas', [])

    ruta_original = get_resource_path(f'docs/{codigo}.xlsx')

    if not os.path.exists(ruta_original):
        raise FileNotFoundError(
            f'El archivo "{codigo}" no existe en: {ruta_original}')

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
        hoja.range('G14').value = titulos or '-'

        # --- Observaciones ---
        observaciones_limpio = observaciones.strip() if observaciones else ''
        if observaciones_limpio:
            primera_linea = textwrap.wrap(observaciones_limpio, width=85)
            resto = textwrap.wrap(
                observaciones_limpio[len(primera_linea[0]):].strip(), width=115)
            lineas = [primera_linea[0]] + resto[:2]
        else:
            lineas = []

        celdas_obs = ['C52', 'B53', 'B54']
        for i in range(min(3, len(lineas))):
            hoja.range(celdas_obs[i]).value = lineas[i]

        # --- Cuotas ---
        celdas_cuotas = ['C61', 'C62', 'C63', 'C64']
        celdas_fechas = ['G61', 'G62', 'G63', 'G64']
        for i, cuota_obj in enumerate(cuotas_objetos):
            if i >= len(celdas_cuotas):
                break
            hoja.range(celdas_cuotas[i]).value = cuota_obj.get('monto')
            hoja.range(celdas_fechas[i]).value = cuota_obj.get('fecha')

        # --- Guardado ---
        hoy = datetime.now()
        anio = hoy.strftime("%Y")
        mes_dia = hoy.strftime("%m%d")
        abreviado_usuario = (usuario[:3] if usuario else 'USR').upper()

        hoja.range(
            'E19').value = f"CZ-{anio}-{mes_dia}-{abreviado_usuario}-{codigo}"

        with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as temp_file:
            ruta_salida = temp_file.name

        wb.save(ruta_salida)
        wb.close()
        return ruta_salida
    except Exception as e:
        # Asegurar que Excel se cierre si hay error
        if 'wb' in locals():
            wb.close()
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
