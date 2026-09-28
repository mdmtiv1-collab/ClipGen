const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const http = require('http');
const { fork } = require('child_process');

let mainWindow = null;
let serverProcess = null;
const PORT = 3001;

function isServerAlive() {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${PORT}/api/projects`, (res) => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(800, () => {
      req.abort();
      resolve(false);
    });
  });
}

async function ensureBackendRunning() {
  const alive = await isServerAlive();
  if (alive) {
    console.log('[ClipGen Desktop] Backend já está ativo na porta', PORT);
    return;
  }

  console.log('[ClipGen Desktop] Iniciando backend interno...');
  const serverScript = path.join(__dirname, '..', 'server', 'index.js');
  serverProcess = fork(serverScript, [], {
    cwd: path.join(__dirname, '..', 'server'),
    env: { ...process.env, PORT: PORT.toString(), NODE_ENV: 'production' },
    silent: true
  });

  serverProcess.on('error', (err) => {
    console.error('[ClipGen Desktop] Erro ao iniciar backend:', err);
  });

  for (let i = 0; i < 25; i++) {
    await new Promise((r) => setTimeout(r, 300));
    if (await isServerAlive()) {
      console.log('[ClipGen Desktop] Backend online e pronto!');
      return;
    }
  }
}

function createMainWindow() {
  const iconPath = path.join(__dirname, '..', 'client', 'public', 'clipgen.ico');

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: 'ClipGen - Criador Inteligente de Vídeos',
    icon: iconPath,
    backgroundColor: '#0a0b0e',
    autoHideMenuBar: true,
    show: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadURL(`http://127.0.0.1:${PORT}`);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(`http://127.0.0.1:${PORT}`) && !url.startsWith(`http://localhost:${PORT}`)) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.clipgen.studio');
  }

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    await ensureBackendRunning();
    createMainWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (serverProcess) {
      try {
        serverProcess.kill();
      } catch (e) {}
    }
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('before-quit', () => {
    if (serverProcess) {
      try {
        serverProcess.kill();
      } catch (e) {}
    }
  });
}
