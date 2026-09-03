const { app, BrowserWindow, dialog } = require('electron')
const { autoUpdater } = require('electron-updater')
const path = require('path')
const fs = require('fs')
const isDev = require('electron-is-dev')
const execFile = require('child_process').execFile

const API_PROD_PATH = path.join(process.resourcesPath, '../lib/api/api.exe')
const API_DEV_PATH = path.join(__dirname, '../backend/main.py')
const INDEX_PATH = path.join(__dirname, '../build/index.html')
const app_instance = app.requestSingleInstanceLock()

// check if current app is Production or Development using electron-is-dev library
// current app is not production, just run the API from main.py,else run the api from API_PROD_PATH
if (isDev) {
  try {
    require('electron-reloader')(module)
  } catch (_) {}

  const { PythonShell } = require('python-shell')

  PythonShell.run(API_DEV_PATH, null, function (err, results) {
    if (err) console.log(err)
  })
} else {
  execFile(API_PROD_PATH, {
    windowsHide: true,
  })
}

//create Main Window
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  })

  // and load the index.html of the app.
  mainWindow.loadFile(INDEX_PATH)

  // Open the DevTools.
  if (isDev) mainWindow.webContents.openDevTools()

  // only one instance exists
  // change to focus if window is minimized
  if (!app_instance) {
    app.quit()
  } else {
    app.on('second-instance', (event, commandline, workingDirectory) => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      }
    })
  }
}

function setupAutoUpdater() {
  // Descarga la actualización automáticamente en segundo plano
  autoUpdater.autoDownload = true

  // Evento que se dispara cuando la actualización ya se descargó
  autoUpdater.on('update-downloaded', () => {
    const dialogOpts = {
      type: 'info',
      buttons: ['Reiniciar ahora', 'Más tarde'],
      title: 'Actualización disponible',
      message: 'Una nueva versión de la aplicación ha sido descargada.',
      detail: '¿Deseas reiniciar la aplicación ahora para aplicar los cambios?',
    }

    // Mostrar el cuadro de diálogo al usuario
    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) {
        // Si el usuario hace clic en "Reiniciar ahora" (índice 0)
        autoUpdater.quitAndInstall()
      }
    })
  })

  autoUpdater.on('error', (err) => {
    console.error('Error en el actualizador:', err)
  })
}

app.whenReady().then(() => {
  createWindow()
  setupAutoUpdater()
  autoUpdater.checkForUpdates()
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// kill all child process before-quit
app.on('before-quit', function () {
  if (isDev) {
    PythonShell.kill(API_DEV_PATH)
  } else {
    execFile().kill('SIGINT')
  }
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
