import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.keys import Keys
import time

def consultar_estado_sunarp(anio, numero_titulo, oficina="LIMA"):
    oficina = oficina.upper()
    options = uc.ChromeOptions()
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument("--start-maximized") 

    driver = None
    try:
        driver = uc.Chrome(options=options, use_subprocess=True)
        driver.get("https://sigueloplus.sunarp.gob.pe/siguelo/")
        
        wait = WebDriverWait(driver, 15)

        # Cerrar términos iniciales
        try:
            btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button.btn-sunarp-cyan")))
            driver.execute_script("arguments[0].click();", btn)
        except: pass 

        # Seleccionar Oficina y Año
        Select(driver.find_element(By.CSS_SELECTOR, "select[id*='Oficina']")).select_by_visible_text(oficina)
        Select(driver.find_element(By.CSS_SELECTOR, "select[id*='Anio']")).select_by_visible_text(str(anio))

        # Escribir Título
        input_t = driver.find_element(By.NAME, "numeroTitulo")
        driver.execute_script("arguments[0].value = arguments[1];", input_t, str(numero_titulo))
        driver.execute_script("arguments[0].dispatchEvent(new Event('input', { bubbles: true }));", input_t)
        input_t.send_keys(Keys.TAB)
        time.sleep(2)

        # Buscar
        btn_buscar = driver.find_element(By.XPATH, "//button[contains(., 'BUSCAR')]")
        driver.execute_script("arguments[0].click();", btn_buscar)

        # Leer resultado
        time.sleep(5)
        res = wait.until(EC.presence_of_element_located((By.ID, "estadoActual")))
        return res.get_attribute('value')

    except Exception as e:
        print(f"Error: {e}")
        return "Error"
    finally:
        if driver:
            driver.quit() # Garantiza que la ventana se cierre siempre