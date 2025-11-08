# Planos Perú App

El aplicativo de Planos Peru usa electron y python para el manejo de excel.

## Table of Contents

- [Inicio](#inicio)
- [Instalación](#instalacion)
- [Uso Basico](#uso-basico)
- [Estructura](#estructura)
- [Creadores](#creadores)

## Inicio

- Clone the repo: `git clone https://github.com/kimberly31-HC/planosperu-app`

### Instalación

```bash
$ npm install
```

### Basic usage

```bash
# dev server with hot reload at http://localhost:3000
$ npm start
```

Navigate to [http://localhost:3000](http://localhost:3000). The app will automatically reload if you change any of the source files.

#### Build

Run `build` to build the project. The build artifacts will be stored in the `build/` directory.

```bash
# build for production with minification
$ npm run build
```

## Escructura

Within the download you'll find the following directories and files, logically grouping common assets and providing both compiled and minified variations. You'll see something like this:

```
coreui-free-react-admin-template
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

## PASOS PARA EJECUTAR

- PROBAR LOCALMENTE (ABRE EL APP del BACKEND)

1. npm run build
2. npm run electron

- PROBAR LOCALMENTE CON MODIFICACIONES COMO AÑADIR DOCUMENTOS EXCEL ENTRE OTROS (ABRE EL APP del BACKEND O SI DESEAS EJECUTA LA APLICACION EN GENERAL)

1. npm run build
2. npm run dist
3. npm run electron

- PUBLICAR VERSIONES

1. Cambiar la version del PACKAGE.JSON
2. npm run install
3. npm run build
4. export GH_TOKEN=
5. npx electron-builder --publish always (DEBE DECIR 100% PARA PODER VER LA NUEVA VERSION)

---- PARA FLASK -----
pip show pyinstaller
pip install pyinstaller
python -m PyInstaller --onefile app.py

## Creadores

**Kimberly**

**Jorge**
