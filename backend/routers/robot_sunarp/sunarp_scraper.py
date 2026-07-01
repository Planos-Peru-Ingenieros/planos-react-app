import time
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.keys import Keys


def consultar_estado_sunarp(anio, numero_titulo, oficina="LIMA"):
    oficina = oficina.upper()
    options = uc.ChromeOptions()
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument("--start-maximized")

    driver = None
    try:
        driver = uc.Chrome(options=options, version_main=148)
        driver.get("https://sigueloplus.sunarp.gob.pe/siguelo/")

        wait = WebDriverWait(driver, 30)

        # 1. Cerrar términos iniciales
        try:
            btn = wait.until(EC.element_to_be_clickable(
                (By.CSS_SELECTOR, "button.btn-sunarp-cyan")))
            driver.execute_script("arguments[0].click();", btn)
        except:
            pass

        # 2. Selección de Oficina y Año
        Select(driver.find_element(By.CSS_SELECTOR,
               "select[id*='Oficina']")).select_by_visible_text(oficina)
        Select(driver.find_element(By.CSS_SELECTOR,
               "select[id*='Anio']")).select_by_visible_text(str(anio))

        # 3. Ingreso de Título y ESPERA PARA RECAPTCHA
        input_t = driver.find_element(By.NAME, "numeroTitulo")
        driver.execute_script(
            "arguments[0].value = arguments[1];", input_t, str(numero_titulo))
        driver.execute_script(
            "arguments[0].dispatchEvent(new Event('input', { bubbles: true }));", input_t)
        input_t.send_keys(Keys.TAB)

        print("Esperando verificación de seguridad (Cloudflare)...")
        time.sleep(8)

        # -------------------------------------------------------------------------
        # 🌟 NUEVO: INYECTAR INTERCEPTOR DE RED PARA CAPTURAR EL JSON DE LA API
        # -------------------------------------------------------------------------
        interceptor_js = """
        window.__sunarpApiData = null;

        // Interceptar peticiones XMLHttpRequest
        const origOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            this.addEventListener('load', function() {
                if (url.includes('/consultaTitulo') || this.responseURL.includes('/consultaTitulo')) {
                    try {
                        window.__sunarpApiData = JSON.parse(this.responseText);
                    } catch(e) {}
                }
            });
            origOpen.apply(this, arguments);
        };

        // Interceptar peticiones Fetch (por si acaso la web usa fetch)
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
        driver.execute_script(interceptor_js)

        # 4. Click en Buscar
        btn_buscar = driver.find_element(
            By.XPATH, "//button[contains(., 'BUSCAR')]")
        driver.execute_script("arguments[0].click();", btn_buscar)

        # 5. ESPERAR Y EXTRAER EL JSON DE LA MEMORIA DEL NAVEGADOR
        api_data = None

        # Hacemos un bucle de hasta 15 segundos esperando a que la API responda
        for _ in range(15):
            time.sleep(1)
            # Extraemos la variable global donde el interceptor guardó el JSON
            api_data = driver.execute_script("return window.__sunarpApiData;")
            if api_data:
                break

        # Manejo del RECUADRO "OK" por si falló la búsqueda inicial
        if not api_data:
            try:
                btn_ok = driver.find_element(By.XPATH, "//button[text()='OK']")
                if btn_ok.is_displayed():
                    driver.execute_script("arguments[0].click();", btn_ok)
                    print(
                        "Aviso de captcha cerrado. Reintentando carga de resultados...")

                    # Esperamos de nuevo tras presionar OK
                    for _ in range(15):
                        time.sleep(1)
                        api_data = driver.execute_script(
                            "return window.__sunarpApiData;")
                        if api_data:
                            break
            except:
                pass

        # Retornamos el diccionario completo extraído directo de la API
        if api_data:
            return api_data
        else:
            return None

    except Exception as e:
        print(f"Error Scraper: {e}")
        return {"error": "Excepcion", "mensaje": str(e)}

    finally:
        if driver:
            driver.quit()
