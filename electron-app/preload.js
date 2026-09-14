const { contextBridge, ipcRenderer } = require('electron');

// Exponemos una API segura al contexto del navegador (index.html)
contextBridge.exposeInMainWorld('electronAPI', {
    testNotification: () => ipcRenderer.send('test-notification')
});
