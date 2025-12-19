# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['backend/main.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('public/favicon.ico', '.'),
        ('backend/docs', 'docs'),
        ('backend/routers', 'routers'),
        # CORRECCIÓN: Usamos barras / para que PyInstaller no se pierda en Windows
        ('backend/routers/robot_sunarp/sunarp_scraper.py', '.'),
        ('backend/services', 'services'),
        ('backend/utils.py', '.'),
        ('backend/api_model.py', '.'),
        ('backend/config.py', '.')
    ],
    hiddenimports=[
        "main",
        "undetected_chromedriver",
        "selenium",
        "selenium.webdriver.support.ui",
        "selenium.webdriver.support.expected_conditions",
        "uvicorn.logging",
        "uvicorn.lifespan.off",
        "uvicorn.lifespan.on",
        "uvicorn.lifespan",
        "uvicorn.protocols.http.auto",
        "uvicorn.protocols.http.h11_impl",
        "uvicorn.protocols.http",
        "uvicorn.loops.auto",
        "uvicorn.loops.asyncio",
        "uvicorn.protocols",
        "sunarp_scraper", # CORRECCIÓN: Se añadió la coma faltante aquí
        "asgiref",
        "fastapi",
        "pydantic",
        "pydantic_core._pydantic_core",
        "requests",    
        "openpyxl",      
        "fitz",     
        "xlwings"        
    ],
    hookspath=[],
    runtime_hooks=[],
    excludes=["uvloop"], 
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False
)

pyz = PYZ(
    a.pure, 
    a.zipped_data,
    cipher=block_cipher
)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='api',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True, 
    icon='public/favicon.ico'
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='api'
)