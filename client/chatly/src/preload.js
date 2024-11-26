const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    firstTime: (me) => ipcRenderer.invoke('firstTime', me),
});