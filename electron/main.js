const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development';

// Текущая версия приложения — сверяется с версией в Supabase (таблица app_versions),
// чтобы показать пользователю баннер "доступно обновление".
const APP_VERSION = require('../package.json').version;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    frame: true,
    icon: path.join(__dirname, '../build/icon.png'),
    backgroundColor: '#0f1115',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// Позволяет фронтенду узнать текущую версию через window.electronAPI.getAppVersion()
ipcMain.handle('app:getVersion', () => APP_VERSION);

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
