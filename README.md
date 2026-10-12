# Planos Perú App

El aplicativo de Planos Peru usa electron y python para el manejo de excel.

## 🌟 Funcionalidades

- Bot Automatizado: entra a la pagina de Siguelo SUNARP y rellena los datos, saltando la verificación de Cloudflare, para verificar el estado del Titulo.
- Cotizaciones: formulario para automatizar el llenado de Excel de cotizaciones.
- Asistencia: consulta la API de un reconocimiento facial local para la asistencia de trabajadores
 
## Tecnologias Principales

- Front End: React, CoreUI, Vite
- Contenedor de escritorio: Electron
- Backend / Procesamiento: Python, FastAPI

## Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Instalación y Configuración](#inicio)
- [Estructura del Proyecto](#estructura)
- [Entorno de Desarrollo (Local)](#entorno)
- [Construcción y despliegue](#construccion)
- [Solucion de Problemas Comunes](#solucion)

## Requisitos Previos

- Node.js
- Python 3.x
- Git 

## Instalación y Configuración

1. Clonar el repositorio

```bash
git clone https://github.com/Planos-Peru-Ingenieros/planos-react-app
cd planosperu-app
```

2. Instalar dependencias de Node

```bash
npm install
```

## Escructura

El proyecto está organizado de la siguiente manera para separar la lógica de la vista, la configuración y el procesamiento en backend:

```
planos-react-app
├── backend/         # Scripts de Python para manejo de Excel
│   └── main.py      # Punto de entrada del procesamiento
│
├── public/          # static files
│   ├── favicon.ico
│   └── manifest.json
│
├── src/             # project root
│   ├── assets/      # images, icons, etc.
│   ├── components/  # common components - header, footer, sidebar, etc.
│   ├── layouts/     # layout containers
│   ├── scss/        # scss styles
│   ├── views/       # application views
│   ├── _nav.js      # sidebar navigation config
│   ├── App.js
│   ├── index.js
│   ├── routes.js    # routes config
│   └── store.js     # template state example
│
├── index.html       # html template
├── ...
├── package.json
├── ...
└── vite.config.mjs  # vite config
```


## Entorno de Desarrollo (Local)
Para probar la aplicación localmente, necesitas levantar tanto el entorno frontend como el backend en Python.

```bash
npm start
```

```bash
python backend/main.py
```


## Construcción y despliegue

1. Actualizar la versión: Sube la versión en el archivo package.json (ej. de 1.0.0 a 1.0.1).
2. Construir el Frontend (Minificado):
```
npm run build
```
3. Construir el ejecutable de Python:
```
npm run py-build
```
4. Configurar el Token de GitHub (Necesario para Release):
```
export GH_TOKEN=<TU_TOKEN>
```
5. Generar el Release en GitHub:
```
npm run release
```

## Solución de Problemas Comunes

Error de Caché con Electron Builder:
Si al intentar empaquetar o correr la aplicación encuentras un error relacionado con Electron Builder en Windows, configura la ruta de caché manualmente ejecutando:

```
export ELECTRON_BUILDER_CACHE="C:\electron-cache"
```

## Creadores

**Jorge**

**Toni**
