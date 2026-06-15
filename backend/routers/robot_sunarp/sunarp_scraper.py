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

        # 3. Ingreso de Título y ESPERA PARA RECAPTCHA (Cloudflare)
        input_t = driver.find_element(By.NAME, "numeroTitulo")
        driver.execute_script(
            "arguments[0].value = arguments[1];", input_t, str(numero_titulo))
        driver.execute_script(
            "arguments[0].dispatchEvent(new Event('input', { bubbles: true }));", input_t)
        input_t.send_keys(Keys.TAB)

        # --- MODIFICACIÓN AQUÍ: Aumentamos a 8 segundos para que cargue la verificación ---
        print("Esperando verificación de seguridad (Cloudflare)...")
        time.sleep(8)
        # ----------------------------------------------------------------------------------

        # 4. Click en Buscar
        btn_buscar = driver.find_element(
            By.XPATH, "//button[contains(., 'BUSCAR')]")
        driver.execute_script("arguments[0].click();", btn_buscar)

        # 5. MANEJO DEL RECUADRO "OK" (Si la verificación falló o tardó más)
        time.sleep(10)
        try:
            btn_ok = driver.find_element(By.XPATH, "//button[text()='OK']")
            if btn_ok.is_displayed():
                driver.execute_script("arguments[0].click();", btn_ok)
                print("Aviso de captcha cerrado. Reintentando carga de resultados...")
                time.sleep(8)
        except:
            pass

        res = wait.until(EC.presence_of_element_located(
            (By.ID, "estadoActual")))
        time.sleep(2)
        valor_final = res.get_attribute('value')
        fecha_vencimiento = ""
        presentante = driver.find_element(
            By.ID, "nombrePresentante").get_attribute('value')
        try:
            input_fecha = driver.find_element(By.ID, "fechaVencimiento")
            fecha_vencimiento = input_fecha.get_attribute(
                'value')  # Debería venir como dd/mm/yyyy
        except Exception:
            fecha_vencimiento = ""

        return {
            "estado": valor_final if valor_final else "Sin Estado",
            "vencimiento": fecha_vencimiento,
            "presentante": presentante if presentante else ""
        }

    except Exception as e:
        print(f"Error Scraper: {e}")
        # Devolver diccionario de error
        return {"estado": "Error", "vencimiento": ""}
    finally:
        if driver:
            driver.quit()
