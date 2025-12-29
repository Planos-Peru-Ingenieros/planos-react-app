from datetime import datetime
import traceback
from fastapi import APIRouter, Request
from fastapi.responses import FileResponse
from services import excel_service

router = APIRouter()


def generar_nombre_archivo(data, ext, prefijo="CZ"):
    codigo = data.get('codigo', 'cotizacion')
    nombre = data.get('usuario', 'usuario')
    hoy = datetime.now()
    anio = hoy.strftime("%Y")
    mes_dia = hoy.strftime("%m%d")
    abreviado = (nombre[:3] if nombre else 'USR').upper()
    return f"{prefijo}-{anio}-{mes_dia}-{abreviado}-{codigo}.{ext}"


@router.post("/crear-cotizacion")
async def crear_cotizacion(request: Request):
    try:
        data = await request.json()
        ruta_xlsx = excel_service.generar_excel_cotizacion(data)
        filename = generar_nombre_archivo(data, "xlsx")

        return FileResponse(
            ruta_xlsx,
            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            filename=filename
        )
    except Exception as e:
        print(traceback.format_exc())
        return f'Error: {str(e)}', 500


@router.post("/crear-cotizacion-pdf")
async def crear_cotizacion_pdf(request: Request):
    try:
        data = await request.json()
        ruta_xlsx = excel_service.generar_excel_cotizacion(data)
        ruta_pdf = excel_service.convertir_xlsx_a_pdf(ruta_xlsx)
        filename = generar_nombre_archivo(data, "pdf")

        return FileResponse(ruta_pdf, media_type='application/pdf', filename=filename)
    except Exception as e:
        print(traceback.format_exc())
        return f'Error: {str(e)}', 500


@router.post("/crear-cotizacion-jpg")
async def crear_cotizacion_jpg(request: Request):
    try:
        data = await request.json()
        ruta_xlsx = excel_service.generar_excel_cotizacion(data)
        ruta_pdf = excel_service.convertir_xlsx_a_pdf(ruta_xlsx)
        ruta_jpg = excel_service.convertir_pdf_a_jpg(ruta_pdf)
        filename = generar_nombre_archivo(data, "jpg")

        return FileResponse(ruta_jpg, media_type='image/jpeg', filename=filename)
    except Exception as e:
        print(traceback.format_exc())
        return f'Error: {str(e)}', 500
