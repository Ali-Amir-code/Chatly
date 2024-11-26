const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');

let mainWindow;

let isQuitting = false;

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
  ipcMain.handle('save-data', saveData);
  ipcMain.handle('firstTime', (event, me) => {
    myData.me = me;
    loadMessageScreen(mainWindow);
  });
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
