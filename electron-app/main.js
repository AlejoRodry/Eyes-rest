const { app, BrowserWindow, Tray, Menu, Notification, ipcMain, nativeImage } = require('electron');
const path = require('path');
const AutoLaunch = require('auto-launch');

let mainWindow = null;
let tray = null;
let isQuitting = false;

// 1. Configurar inicio automático (Auto-Launch)
const appAutoLauncher = new AutoLaunch({
    name: 'Eye Rest 20-20-20',
    path: app.getPath('exe'),
});

appAutoLauncher.isEnabled().then((isEnabled) => {
    if (!isEnabled) {
        appAutoLauncher.enable();
    }
}).catch((err) => {
    console.error('Error con auto-launch:', err);
});

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 360,
        height: 480,
        title: "Descanso Ocular 20-20-20",
        resizable: false,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true, // Seguridad: aísla el renderizador
            nodeIntegration: false  // No permitir Node en index.html
        }
    });

    mainWindow.loadFile('index.html');

    // 2. Al cerrar con la 'X', solo ocultamos la ventana
    mainWindow.on('close', (event) => {
        if (!isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
        return false;
    });
}

function createTray() {
    // Para producción, debes colocar tu propio 'icon.png' en la carpeta.
    // Usamos nativeImage.createEmpty() como fallback seguro si no pones icono temporalmente.
    let trayIcon = nativeImage.createEmpty();
    try {
        // Intenta cargar el icono (opcional: pon tu propio icon.png)
        // trayIcon = nativeImage.createFromPath(path.join(__dirname, 'icon.png'));
    } catch(e){}

    tray = new Tray(trayIcon);

    // 3. Menú contextual del System Tray
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Abrir Panel', click: () => { mainWindow.show(); } },
        { label: 'Probar Notificación', click: () => { sendNotification(); } },
        { type: 'separator' },
        { label: 'Salir', click: () => {
            isQuitting = true;
            app.quit();
        }}
    ]);

    tray.setToolTip('20-20-20 Eye Rest');
    tray.setContextMenu(contextMenu);

    tray.on('double-click', () => {
        mainWindow.show();
    });
}

// 4. Lógica de Notificaciones Nativas
function sendNotification() {
    if (Notification.isSupported()) {
        new Notification({
            title: '⏱️ Tiempo de descanso',
            body: 'Mira a un objeto a 6 metros (20 pies) de distancia durante 20 segundos.'
        }).show();
    }
}

app.whenReady().then(() => {
    createWindow();
    createTray();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// En Windows, no cerramos la app al cerrar la ventana, se queda en el Tray
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        // Vaciado a propósito para mantener el proceso vivo
    }
});

// 5. Escuchar eventos desde la interfaz web (index.html)
ipcMain.on('test-notification', () => {
    sendNotification();
});
