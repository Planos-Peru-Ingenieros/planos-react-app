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
        ('backend/services', 'services'),
        ('backend/utils.py', '.'),
        ('backend/api_model.py', '.'),
        ('backend/config.py', '.')
    ],
    # Dentro de api.spec
    hiddenimports=[
        "main",
        "undetected_chromedriver",
        "selenium",
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
    excludes=["uvloop"], # Se excluye porque suele dar problemas en Windows
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
    console=True, # Déjalo en True para poder ver errores si el backend falla al iniciar
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