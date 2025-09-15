const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // It's good practice, but we'll keep it simple for now
      contextIsolation: false, // For simplicity, not recommended for production
      nodeIntegration: true,   // For simplicity, not recommended for production
    },
  });

  mainWindow.loadFile('index.html');
  mainWindow.webContents.openDevTools(); // Open dev tools for debugging
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});