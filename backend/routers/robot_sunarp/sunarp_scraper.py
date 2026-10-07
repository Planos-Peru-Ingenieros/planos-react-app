import base64
import hashlib
import json
import time

import undetected_chromedriver as uc
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select, WebDriverWait


def desencriptar_cryptojs(encrypted_base64):
    """
    Desencripta un string Base64 generado por CryptoJS.AES.encrypt
    usando una contraseña de texto plano.
    """
    passphrase = "sV2zUWiuNo@3uv8nu9ir4"
    try:
        # Decodificar el Base64 a bytes puros
        encrypted_data = base64.b64decode(encrypted_base64)

        # CryptoJS siempre añade el prefijo "Salted__" (8 bytes) + Salt aleatorio (8 bytes)
        if encrypted_data[0:8] != b"Salted__":
            raise ValueError(
                "El payload no tiene el prefijo de OpenSSL 'Salted__'")

        salt = encrypted_data[8:16]
        ciphertext = encrypted_data[16:]  # El mensaje encriptado real

        # Derivar la llave de 32 bytes y el IV de 16 bytes usando el estándar de CryptoJS (MD5)
        key_iv = b""
        previous_hash = b""
        while len(key_iv) < 48:  # 32 (Key) + 16 (IV) = 48 bytes
            previous_hash = hashlib.md5(
                previous_hash + passphrase.encode('utf-8') + salt).digest()
            key_iv += previous_hash

        key = key_iv[:32]
        iv = key_iv[32:48]

        # Desencriptar usando AES en modo CBC
        cipher = AES.new(key, AES.MODE_CBC, iv)
        decrypted_padded = cipher.decrypt(ciphertext)

        # Quitar el padding y decodificar a texto
        decrypted_text = unpad(
            decrypted_padded, AES.block_size).decode('utf-8')

        # Convertir el string JSON a un diccionario de Python
        return json.loads(decrypted_text)

    except Exception as e:
        print(f"Error al desencriptar: {e}")
        return None


def consultar_estado_sunarp(anio, numero_titulo, oficina="LIMA"):
    oficina = oficina.upper()
    options = uc.ChromeOptions()
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument("--start-maximized")

    driver = None

    # -------------------------------------------------------------------------
    # 1. MANEJO DE ERROR: VERSIÓN DE CHROME INCORRECTA
    # -------------------------------------------------------------------------
    try:
        driver = uc.Chrome(options=options)
    except Exception as e:
        error_msg = str(e).lower()
        if "version of chrome" in error_msg or "chrome version" in error_msg or "session not created" in error_msg:
            return {
                "error": "Error de versión de Chrome",
                "mensaje": "Tu versión de Chrome no coincide con ChromeDriver. Actualiza el navegador o la librería undetected-chromedriver."
            }
        else:
            return {"error": "Error al iniciar el navegador", "mensaje": str(e)}

    try:
        wait = WebDriverWait(driver, 15)

        interceptor_js = """
        window.__sunarpApiData = null;

        // Interceptar peticiones XMLHttpRequest
        const origOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            this.addEventListener('load', function() {
                if (url.includes('/consultaTitulo') || this.responseURL.includes('/consultaTitulo')) {
                    try { window.__sunarpApiData = JSON.parse(this.responseText); } catch(e) {}
                }
            });
            origOpen.apply(this, arguments);
        };

        // Interceptar peticiones Fetch
        const origFetch = window.fetch;
        window.fetch = async function(...args) {
            const response = await origFetch.apply(this, args);
            const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');
            if (url.includes('/consultaTitulo')) {
                response.clone().json().then(data => { window.__sunarpApiData = data; }).catch(e => {});
            }
            return response;
        };
        """

        # -------------------------------------------------------------------------
        # 2. SISTEMA DE REINTENTOS (MÁXIMO 2 INTENTOS)
        # -------------------------------------------------------------------------
        for intento in range(1, 3):
            print(f"\n--- Iniciando intento {intento} de 2 ---")
            try:
                # Recargar la página limpia en cada intento
                driver.get("https://sigueloplus.sunarp.gob.pe/siguelo/")

                # Inyectar interceptor lo más rápido posible
                driver.execute_script(interceptor_js)

                # Cerrar términos iniciales si aparecen
                try:
                    btn = WebDriverWait(driver, 5).until(EC.element_to_be_clickable(
                        (By.CSS_SELECTOR, "button.btn-sunarp-cyan")))
                    driver.execute_script("arguments[0].click();", btn)
                except:
                    pass

                # Selección de Oficina y Año (Usando esperas explícitas para mayor rapidez y seguridad)
                Select(wait.until(EC.presence_of_element_located(
                    (By.CSS_SELECTOR, "select[id*='Oficina']")))).select_by_visible_text(oficina)
                Select(wait.until(EC.presence_of_element_located(
                    (By.CSS_SELECTOR, "select[id*='Anio']")))).select_by_visible_text(str(anio))

                # Ingreso de Título
                input_t = wait.until(
                    EC.presence_of_element_located((By.NAME, "numeroTitulo")))
                driver.execute_script(
                    "arguments[0].value = arguments[1];", input_t, str(numero_titulo))
                driver.execute_script(
                    "arguments[0].dispatchEvent(new Event('input', { bubbles: true }));", input_t)
                input_t.send_keys(Keys.TAB)

                print("Esperando verificación de seguridad (Cloudflare)...")
                time.sleep(8)

                # Click en Buscar
                btn_buscar = wait.until(EC.element_to_be_clickable(
                    (By.XPATH, "//button[contains(., 'BUSCAR')]")))
                driver.execute_script("arguments[0].click();", btn_buscar)

                # Esperar y extraer JSON
                api_data = None
                for _ in range(15):
                    time.sleep(1)
                    api_data = driver.execute_script(
                        "return window.__sunarpApiData;")
                    if api_data:
                        break

                # Manejo del RECUADRO "OK" por si saltó una alerta de bloqueo
                if not api_data:
                    try:
                        btn_ok = driver.find_element(
                            By.XPATH, "//button[text()='OK']")
                        if btn_ok.is_displayed():
                            driver.execute_script(
                                "arguments[0].click();", btn_ok)
                            print(
                                "Aviso de seguridad cerrado. Esperando respuesta...")
                            for _ in range(10):
                                time.sleep(1)
                                api_data = driver.execute_script(
                                    "return window.__sunarpApiData;")
                                if api_data:
                                    break
                    except:
                        pass

                # 3. EVALUACIÓN DEL INTENTO
                if api_data:
                    payload_encriptado = api_data.get("cmVzcG9uc2U")
                    desencriptado = desencriptar_cryptojs(payload_encriptado)
                    print(desencriptado)
                    return desencriptado
                else:
                    print("No se logró capturar la API en este intento.")

            except Exception as e:
                print(
                    f"Ocurrió un problema durante el intento {intento}: {str(e)}")

            # Si llegamos aquí y es el primer intento, esperamos un poco antes de recargar
            if intento == 1:
                print("Recargando la página para el segundo intento...")
                time.sleep(2)

        # -------------------------------------------------------------------------
        # 4. MENSAJE DE ERROR SI FALLÓ EL SEGUNDO INTENTO
        # -------------------------------------------------------------------------
        return {
            "error": "Error de recuperación de API",
            "mensaje": "No se logró recuperar la API de Sunarp después de 2 intentos. Es posible que Cloudflare esté bloqueando la consulta temporalmente."
        }

    except Exception as e:
        print(f"Error crítico en el scraper: {e}")
        return {"error": "Excepcion Crítica", "mensaje": str(e)}

    finally:
        if driver:
            driver.quit()
