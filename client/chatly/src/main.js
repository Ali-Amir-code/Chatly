const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');

let mainWindow;

let isQuitting = false;


if (require('electron-squirrel-startup')) {
  app.quit();
}

async function isDataFileExists() {
  try {
    await fs.access(path.join(app.getPath('userData'), 'data.json'));
    return true;
  } catch {
    return false;
  }
}

async function loadData() {
  const data = await fs.readFile(path.join(app.getPath('userData'), 'data.json'), 'utf-8');
  return JSON.parse(data);
}

async function createDataFile() {
  await fs.writeFile(path.join(app.getPath('userData'), 'data.json'), JSON.stringify({}));
}

async function saveData(data) {
  await fs.writeFile(path.join(app.getPath('userData'), 'data.json'), JSON.stringify(data));
  isQuitting = true;
  app.quit();
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
      const data = await loadData();
      mainWindow.loadFile(path.join(__dirname, 'renderer/html/index.html'));
      mainWindow.webContents.once('did-finish-load', () => {
        mainWindow.webContents.send('data', data);
      });
    } else {
      await createDataFile();
      mainWindow.loadFile(path.join(__dirname, 'renderer/html/firstTime.html'));
    }
  }
   catch (err) {

  }
  ipcMain.handle('save-data', saveData);
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
  if(process.platform !== 'darwin') {
    if(!isQuitting) {
      return
    }
    app.quit();
  }
});
