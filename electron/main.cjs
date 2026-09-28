const { app, BrowserWindow, shell, dialog } = require('electron');
const path = require('path');
const http = require('http');

let mainWindow = null;
const PORT = 3001;

function isServerAlive() {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${PORT}/api/projects`, (res) => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(600, () => {
      req.abort();
      resolve(false);
    });
  });
}

async function startInternalServer() {
  const alive = await isServerAlive();
  if (alive) {
    console.log('[ClipGen Desktop] Servidor backend já ativo na porta', PORT);
    return true;
  }

  console.log('[ClipGen Desktop] Iniciando servidor backend...');
  try {
    const serverScript = path.join(__dirname, '..', 'server', 'index.js');
    console.log('[ClipGen Desktop] Carregando backend em:', serverScript);
    require(serverScript);
  } catch (err) {
    console.error('[ClipGen Desktop] Erro ao carregar servidor interno:', err);
    dialog.showErrorBox('Erro ao Iniciar o Servidor do ClipGen', `Falha ao inicializar o motor local:\n${err.stack || err.message}`);
    return false;
  }

  // Aguardar até o servidor responder
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 200));
    if (await isServerAlive()) {
      console.log('[ClipGen Desktop] Servidor backend pronto!');
      return true;
    }
  }

  dialog.showErrorBox('ClipGen - Tempo Limite', 'O servidor interno não respondeu a tempo.');
  return false;
}

process.on('uncaughtException', (err) => {
  console.error('[ClipGen Desktop] Uncaught exception:', err);
  try {
    dialog.showErrorBox('Erro no ClipGen', `Ocorreu um erro no aplicativo:\n${err.stack || err.message}`);
  } catch (e) {}
});

process.on('unhandledRejection', (reason) => {
  console.error('[ClipGen Desktop] Unhandled rejection:', reason);
});

function createMainWindow() {
  let iconPath = null;
  try {
    const candidate = path.join(__dirname, 'clipgen.ico');
    if (fs.existsSync(candidate)) {
      iconPath = candidate;
    }
  } catch (e) {}

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: 'ClipGen - Criador Inteligente de Vídeos',
    ...(iconPath ? { icon: iconPath } : {}),
    backgroundColor: '#0a0b0e',
    autoHideMenuBar: true,
    show: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.loadURL(`http://127.0.0.1:${PORT}`);

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer] [L${level}] ${message} (${sourceId}:${line})`);
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.warn('[ClipGen Desktop] Falha ao carregar página. Tentando novamente...', errorCode, errorDescription);
    setTimeout(() => {
      if (mainWindow) {
        mainWindow.loadURL(`http://127.0.0.1:${PORT}`);
      }
    }, 1000);
  });

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

if (process.platform === 'win32') {
  app.setAppUserModelId('com.clipgen.studio');
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    const serverOk = await startInternalServer();
    if (serverOk) {
      createMainWindow();
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
