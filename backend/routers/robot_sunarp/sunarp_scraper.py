import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.keys import Keys
import time
import ctypes

def forzar_primer_plano(driver):
    """Obliga a Windows a mostrar la ventana si se escondió"""
    try:
        driver.execute_script("document.title = 'ROBOT_SUNARP_ACTIVO';")
        time.sleep(0.5)
        user32 = ctypes.windll.user32
        hwnd = user32.FindWindowW(None, "ROBOT_SUNARP_ACTIVO")
        if hwnd:
            user32.ShowWindow(hwnd, 9) # Restore
            user32.ShowWindow(hwnd, 3) # Maximize
            user32.SetForegroundWindow(hwnd) # Front
    except:
        pass

def consultar_estado_sunarp(anio, numero_titulo, oficina="LIMA"):
    print(f"--- ROBOT ACTIVO: {oficina} {anio}-{numero_titulo} ---")
    
    options = uc.ChromeOptions()
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument("--start-maximized") 

    driver = uc.Chrome(options=options, use_subprocess=True)

    try:
        url = "https://sigueloplus.sunarp.gob.pe/siguelo/"
        driver.get(url)
        
        # Intentamos traer la ventana al frente a la fuerza
        forzar_primer_plano(driver)
        
        time.sleep(3)
        wait = WebDriverWait(driver, 15)

        # 1. CERRAR TÉRMINOS
        try:
            btn_acepto = driver.find_element(By.CSS_SELECTOR, "button.btn-sunarp-cyan")
            driver.execute_script("arguments[0].click();", btn_acepto)
            time.sleep(1)
        except:
            pass 

        # 2. LLENAR DATOS
        try:
            Select(driver.find_element(By.CSS_SELECTOR, "select[id*='Oficina']")).select_by_visible_text(oficina)
            Select(driver.find_element(By.CSS_SELECTOR, "select[id*='Anio']")).select_by_visible_text(str(anio))
        except Exception as e:
            print(f"Error seleccionando listas: {e}")
            return "Error Listas"

        # 3. ESCRIBIR TÍTULO (MÉTODO BLINDADO CON JS)
        # Usamos JS para escribir directo en el código, así no importa si el teclado falla
        input_numero = driver.find_element(By.NAME, "numeroTitulo")
        
        driver.execute_script("arguments[0].value = arguments[1];", input_numero, str(numero_titulo))
        # Disparamos evento para que la web detecte el cambio
        driver.execute_script("arguments[0].dispatchEvent(new Event('input', { bubbles: true }));", input_numero)
        
        # Simulamos salida del campo
        input_numero.send_keys(Keys.TAB)
        time.sleep(4) 

        # 4. MANEJO DE ERROR (SI SALE POPUP DE 'INGRESE NUMERO')
        try:
            alertas = driver.find_elements(By.CSS_SELECTOR, "button.swal2-confirm, button.btn-primary")
            for alerta in alertas:
                if alerta.is_displayed() and "OK" in alerta.text:
                    driver.execute_script("arguments[0].click();", alerta)
                    time.sleep(1)
        except:
            pass

        # 5. CLICK EN BUSCAR
        btn_buscar = driver.find_element(By.XPATH, "//button[contains(., 'BUSCAR')]")
        driver.execute_script("arguments[0].click();", btn_buscar)

        # 6. LEER RESULTADO
        time.sleep(5) 

        try:
            input_estado = wait.until(EC.presence_of_element_located((By.ID, "estadoActual")))
            estado_final = input_estado.get_attribute('value')
            
            if estado_final:
                return estado_final
            else:
                return "Vacío"
        except Exception:
            return "Error al leer"

    except Exception as e:
        print(f"ERROR GENERAL: {e}")
        return None
    finally:
        time.sleep(2)
        try:
            driver.quit()
        except:
            pass