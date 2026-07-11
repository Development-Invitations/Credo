const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

const isDev = process.env.NODE_ENV === 'development';

// Текущая версия приложения — сверяется с версией в Supabase (таблица app_versions),
// чтобы показать пользователю баннер "доступно обновление".
const APP_VERSION = require('../package.json').version;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
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

  // Ссылки, открываемые через window.open() (например "Скачать обновление" в браузере,
  // когда автообновление недоступно) должны идти в системный браузер, а не создавать
  // новое пустое окно Electron.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// Позволяет фронтенду узнать текущую версию через window.electronAPI.getAppVersion()
ipcMain.handle('app:getVersion', () => APP_VERSION);

// --- Автообновление через electron-updater (источник — GitHub Releases) ---
// Скачивание запускается только по явному запросу из интерфейса (не автоматически в фоне),
// чтобы пользователь видел прогресс и сам решал, когда обновляться.
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;

ipcMain.handle('update:check', async () => {
  if (isDev) return { available: false };
  try {
    const result = await autoUpdater.checkForUpdates();
    return { available: !!result?.updateInfo && result.updateInfo.version !== APP_VERSION };
  } catch (e) {
    return { available: false, error: e.message };
  }
});

ipcMain.handle('update:download', async () => {
  try {
    await autoUpdater.checkForUpdates();
    await autoUpdater.downloadUpdate();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

ipcMain.handle('update:install', () => {
  autoUpdater.quitAndInstall();
});

autoUpdater.on('download-progress', (progress) => {
  mainWindow?.webContents.send('update:progress', progress.percent);
});
autoUpdater.on('update-downloaded', () => {
  mainWindow?.webContents.send('update:downloaded');
});
autoUpdater.on('error', (err) => {
  mainWindow?.webContents.send('update:error', err.message);
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
