import os
from datetime import datetime
import sys
import tempfile
import traceback
import fitz
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import xlwings as xw
import api_model

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
        # Modo PyInstaller
        base_path = sys._MEIPASS
    except Exception:
        # Modo script normal
        # Usa la ruta del directorio donde está ESTE archivo .py
        base_path = os.path.dirname(os.path.abspath(__file__))

    return os.path.join(base_path, relative_path)


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

    codigo = data.get('codigo')
    nombre = data.get('usuario')
    detalles = data.get('detalles', '')
    cliente = data.get('cliente')
    ubicacion = data.get('ubicacion')
    telefono = data.get('telefono')
    dni = data.get('dni')
    observaciones = data.get('observaciones') or ' '
    pisos = data.get('piso')
    area = data.get('area')
    cuotas = data.get('cuotas', [])
    fechas = data.get('fechas', [])

    # Verificar si el archivo de plantilla existe con el nombre del código
    ruta_original = get_resource_path(f'docs/{codigo}.xlsx')
    if not os.path.exists(ruta_original):
        raise FileNotFoundError(
            f'El archivo con el código "{codigo}" no se encuentra')

    # Iniciar Excel de forma oculta
    app_excel = xw.App(visible=False)
    wb = app_excel.books.open(ruta_original)
    hoja = wb.sheets[0]

    # Limitar el tamaño de los detalles
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

    # Rellenar los datos del cliente y la ubicación
    hoja.range('B15').value = cliente
    hoja.range('G15').value = ubicacion
    hoja.range('G16').value = telefono
    hoja.range('B17').value = dni
    hoja.range('B14').value = pisos
    hoja.range('D14').value = area

    # Llenar observaciones
    for i, linea in enumerate(observaciones.split('\n'), start=52):
        if i > 54:
            break
        hoja.range(f'C{i}').value = linea

    # Llenar cuotas
    celdas_cuotas = ['C61', 'C62', 'C63', 'C64']
    for i, monto in enumerate(cuotas):
        if i < len(celdas_cuotas):
            hoja.range(celdas_cuotas[i]).value = monto

    # Llenar fechas
    celdas_fechas = ['G61', 'G62', 'G63', 'G64']
    for i, fecha in enumerate(fechas):
        if i < len(celdas_fechas):
            hoja.range(celdas_fechas[i]).value = fecha

    # Crear nombre de archivo único
    hoy = datetime.now()
    anio = hoy.strftime("%Y")
    mes_dia = hoy.strftime("%m%d")
    abreviado_usuario = (nombre[:3] if nombre else 'USR').upper()

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


@app.get("/hello/{name}")
def read_root(name: str):
    return f"hello {name}"


@app.post("/open-explorer/")
def open_explorer(model: api_model.PathModel):

    os.startfile(model.path)

    return f"Opening {model.path}"


if __name__ == "__main__":
    import asyncio
    import uvicorn

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    loop.run_until_complete(uvicorn.run(app, host=HOST, port=PORT))
