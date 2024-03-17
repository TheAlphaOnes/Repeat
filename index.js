const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { electron } = require('process');



function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    alwaysOnTop: true,
    autoHideMenuBar: true,
    
    
    frame: true,
    
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  
  
  win.setAlwaysOnTop(true),
  win.setVisibleOnAllWorkspaces(true),
  win.loadFile('index.html');

  win.on('minimize', (event) => {
    event.preventDefault();
    win.maximize()
  });

  win.on('close', (event) => {

    event.preventDefault();
  });
   
  ipcMain.on('message-from-renderer', (event, data) => {
    console.log('Message received in main process:', data);
    
    event.reply('response-from-main', 'Response data from main process');
  });

}

app.whenReady().then(createWindow);

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
