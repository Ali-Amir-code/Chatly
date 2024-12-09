const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    onReceiveData: (callback) => ipcRenderer.on('my-data', (event, data) => callback(data)),
    onRecieveMessage : (callback) => ipcRenderer.on('message', (event, message) => callback(message)),
    onRecieveNotification : (callback) => ipcRenderer.on('notification', (event, notification) => callback(notification)),
    register: (name, username, password) => ipcRenderer.invoke('register', name, username, password),
    login: async (username,password) => ipcRenderer.invoke('login',username,password),
    addContact : (contactName, contactID) => ipcRenderer.invoke('addContact', contactName, contactID),
    saveData: (data) => ipcRenderer.invoke('saveData', data),
    sendMessage : (message) => ipcRenderer.invoke('message', message),
});