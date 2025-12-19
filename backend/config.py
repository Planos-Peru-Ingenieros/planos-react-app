import os
from requests.auth import HTTPDigestAuth

# Configuración del Servidor
HOST = "127.0.0.1"
PORT = 5000

# Configuración de Hikvision
HK_IP = "192.168.18.101"
HK_USER = "admin"
HK_PASS = "Eunacin0@27" # Considera mover esto a variables de entorno (.env) en el futuro
HK_AUTH = HTTPDigestAuth(HK_USER, HK_PASS)
HK_URL_SEARCH = f"http://{HK_IP}/ISAPI/AccessControl/UserInfo/Search?format=json"
HK_URL_EVENTS = f"http://{HK_IP}/ISAPI/AccessControl/AcsEvent?format=json"