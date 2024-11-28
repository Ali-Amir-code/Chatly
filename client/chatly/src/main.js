const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');

const serverURL = 'http://localhost:3000';

let mainWindow;

let myData = {
  me: null,
  contacts: [],
}

if (require('electron-squirrel-startup')) {
  app.quit();
}

async function isDataFileExists() {
  try {
    await fs.access(path.join(app.getPath('userData'), 'data.json'));
    return false;
  } catch {
    return false;
  }
}

async function loadData() {
  const data = await fs.readFile(path.join(app.getPath('userData'), 'data.json'), 'utf-8');
  return JSON.parse(data);
}

async function registerMe(event, name, username, password) {
  const response = await fetch(`${serverURL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, username, password }),
  });
  if (response.ok) {
    const me = await response.json();
    myData.me = me;
    loadMessageScreen(mainWindow);
  }
}

async function loginMe(event,username,password) {
  const response = await fetch(`${serverURL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({username, password }),
  });
  if(response.ok){

    if (response.status === 401) {
      console.log('User Not Available')
    }
    else{
      const me = await response.json();
      myData.me = me;
      loadMessageScreen(mainWindow);
    }
  }
}

async function saveData() {
  await fs.writeFile(path.join(app.getPath('userData'), 'data.json'), JSON.stringify(myData));
}

function loadMessageScreen(window) {
  window.loadFile(path.join(__dirname, 'renderer/html/index.html'));
  window.webContents.once('did-finish-load', () => {
    window.webContents.send('my-data', myData);
  });
}

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  try {
    if (await isDataFileExists()) {
      myData = await loadData();
      loadMessageScreen(mainWindow);
    } else {
      mainWindow.loadFile(path.join(__dirname, 'renderer/html/firstTime.html'));
    }
  }
  catch (err) {

  }
  ipcMain.handle('register', registerMe);
  ipcMain.handle('login',loginMe);
  ipcMain.handle('saveData', saveData);
};

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') {
    await saveData();
    app.quit();
  }
});
