const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    register: (name, username, password) => ipcRenderer.invoke('register', name, username, password),
    login: async (username,password) => ipcRenderer.invoke('login',username,password),
    saveData: (data) => ipcRenderer.invoke('saveData', data),
});