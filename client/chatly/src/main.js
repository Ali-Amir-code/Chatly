const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const io = require('socket.io-client');

const serverURL = 'http://localhost:3000';

const socket = null;

let mainWindow;

// let myData = {
//   me: {
//     id: 1100,
//     name: 'Ali',
//     username: 'ali',
//     password: '123',
//   },
//   contacts: [
//     {
//       id: '1000',
//       name: 'John Doe',
//       username: '@johndoe',
//       messages: [
//         {
//           content: 'Hello, John',
//           time: '2023-06-01T12:34:56.789Z',
//           from: 'me'
//         },
//         {
//           content: 'Hello, Ali',
//           time: '2023-06-01T12:37:56.789Z',
//           from: 'not-me'
//         }
//       ]
//     },
//     {
//       id: '1001',
//       name: 'Jane Doe',
//       username: '@janedoe',
//       messages: [
//         {
//           content: 'Hello, Jane',
//           time: '2023-06-01T10:34:56.789Z',
//           from: 'me'
//         },
//         {
//           content: 'Hello, Ali',
//           time: '2023-06-01T11:34:56.789Z',
//           from: 'not-me'
//         },
//       ]
//     }
//   ],
// }

let myData;

if (require('electron-squirrel-startup')) {
  app.quit();
}

function initializeSocket(){
  socket = io(serverURL,{
    auth : {
      data : {
        id : myData.me.id,
        username : myData.me.username,
        password : myData.me.password
      }
    }
  });
  socket.emit('setId', myData.me.id);
  socket.on('message', (message) => {
    mainWindow.webContents.send('message', message);
  })
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
  myData = JSON.parse(data);
}

async function registerMe(event, name, username, password) {
  try{

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
      loadMainScreen(mainWindow);
    }
  }catch(err){

  }
}

async function loginMe(event,username,password) {
  try{

    const response = await fetch(`${serverURL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({username, password }),
    });
    if(response.ok){
      if (response.status === 401) {
        return false;
      }
      else{
        const me = await response.json();
        myData.me = me;
        loadMainScreen(mainWindow);
        return true;
      }
    }
  }catch(err){
    
  }
}

async function saveData() {
  await fs.writeFile(path.join(app.getPath('userData'), 'data.json'), JSON.stringify(myData));
}

function loadMainScreen(window) {
  window.loadFile(path.join(__dirname, 'renderer/html/index.html'));
  initializeSocket();
  window.webContents.once('did-finish-load', () => {
    window.webContents.send('my-data', myData);
  });
}

function addContact(event, contactName, contactID) {

}

function sendMessage(event, message) {
  socket.emit('message', message);
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
      await loadData();
      loadMainScreen(mainWindow);
    } else {
      mainWindow.loadFile(path.join(__dirname, 'renderer/html/firstTime.html'));
    }
  }
  catch (err) {

  }
  ipcMain.handle('register', registerMe);
  ipcMain.handle('login',loginMe);
  ipcMain.handle('saveData', saveData);
  ipcMain.handle('message', sendMessage);
  ipcMain.handle('addContact', addContact);
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
