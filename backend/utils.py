import sys
import os

def get_resource_path(relative_path):
    """Devuelve la ruta absoluta al recurso, funciona dentro y fuera de PyInstaller"""
    try:
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_path, relative_path)