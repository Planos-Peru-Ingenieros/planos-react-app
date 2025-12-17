import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.keys import Keys
import time
import ctypes

def forzar_primer_plano(driver):
    try:
        driver.execute_script("document.title = 'ROBOT_SUNARP_ACTIVO';")
        time.sleep(0.5)
        user32 = ctypes.windll.user32
        hwnd = user32.FindWindowW(None, "ROBOT_SUNARP_ACTIVO")
        if hwnd:
            user32.ShowWindow(hwnd, 9)
            user32.ShowWindow(hwnd, 3)
            user32.SetForegroundWindow(hwnd)
    except:
        pass

def consultar_estado_sunarp(anio, numero_titulo, oficina="LIMA"):
    oficina = oficina.upper()
    print(f"--- INICIANDO SCRAPER: {oficina} | {anio}-{numero_titulo} ---")
    
    options = uc.ChromeOptions()
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument("--start-maximized") 

    driver = None
    try:
        driver = uc.Chrome(options=options, use_subprocess=True)
        url = "https://sigueloplus.sunarp.gob.pe/siguelo/"
        driver.get(url)
        
        forzar_primer_plano(driver)
        time.sleep(3)
        wait = WebDriverWait(driver, 15)

        try:
            btn_acepto = driver.find_element(By.CSS_SELECTOR, "button.btn-sunarp-cyan")
            driver.execute_script("arguments[0].click();", btn_acepto)
            time.sleep(1)
        except:
            pass 

        try:
            Select(driver.find_element(By.CSS_SELECTOR, "select[id*='Oficina']")).select_by_visible_text(oficina)
            Select(driver.find_element(By.CSS_SELECTOR, "select[id*='Anio']")).select_by_visible_text(str(anio))
        except Exception as e:
            print(f"Error en selectores de oficina: {e}")
            return "Error Oficina"

        input_numero = driver.find_element(By.NAME, "numeroTitulo")
        driver.execute_script("arguments[0].value = arguments[1];", input_numero, str(numero_titulo))
        driver.execute_script("arguments[0].dispatchEvent(new Event('input', { bubbles: true }));", input_numero)
        input_numero.send_keys(Keys.TAB)
        time.sleep(3) 

        btn_buscar = driver.find_element(By.XPATH, "//button[contains(., 'BUSCAR')]")
        driver.execute_script("arguments[0].click();", btn_buscar)

        time.sleep(5) 
        input_estado = wait.until(EC.presence_of_element_located((By.ID, "estadoActual")))
        return input_estado.get_attribute('value')

    except Exception as e:
        print(f"ERROR EN SCRAPER: {e}")
        return "Error Consulta"
    
    finally:
        if driver:
            time.sleep(1)
            driver.quit()