'use strict';

const { app, BrowserWindow, Menu, shell, protocol, net, session, dialog } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const settings = require('./settings.json');

// A secure, standard scheme supports relative/root-relative PWA paths, storage,
// fetch and (for PWAs that use them) service workers. No Node access in pages.
protocol.registerSchemesAsPrivileged([{
  scheme: 'pwaapp',
  privileges: {
    standard: true,
    secure: true,
    supportFetchAPI: true,
    allowServiceWorkers: true,
    stream: true
  }
}]);

const WEB_DIR = path.join(__dirname, 'web');
const LOCAL_ORIGIN = 'pwaapp://bundle';
const requestedRemote = (settings.remoteUrl || '').trim();
const remoteMode = settings.mode === 'remote';
let remoteOrigin = null;
if (remoteMode) {
  try {
    const url = new URL(requestedRemote);
    if (url.protocol !== 'https:') throw new Error('Remote URLs must use HTTPS.');
    remoteOrigin = url.origin;
  } catch (err) {
    throw new Error('settings.json: remote mode needs a valid https:// remoteUrl. ' + err.message);
  }
}

function isAllowedNavigation(target) {
  try {
    const url = new URL(target);
    if (remoteMode) return url.origin === remoteOrigin;
    return url.protocol === 'pwaapp:' && url.hostname === 'bundle';
  } catch { return false; }
}

function openExternal(target) {
  try {
    const url = new URL(target);
    if (url.protocol === 'https:' || url.protocol === 'mailto:') {
      shell.openExternal(url.href).catch((err) => console.error('External link failed:', err));
    }
  } catch { /* no external navigation for unsafe/invalid URLs */ }
}

function registerLocalFiles() {
  protocol.handle('pwaapp', async (request) => {
    let url;
    try { url = new URL(request.url); }
    catch { return new Response('Bad request', {status: 400}); }
    if (url.hostname !== 'bundle') return new Response('Unknown host', {status: 404});

    let pathname;
    try { pathname = decodeURIComponent(url.pathname); }
    catch { return new Response('Malformed path', {status: 400}); }
    if (pathname.includes('\0') || pathname.includes('\\')) return new Response('Invalid path', {status: 400});

    const candidate = path.resolve(WEB_DIR, '.' + pathname);
    const relative = path.relative(WEB_DIR, candidate);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      return new Response('Forbidden', {status: 403});
    }

    let file = candidate;
    try {
      const info = await fs.promises.stat(file);
      if (info.isDirectory()) file = path.join(file, 'index.html');
    } catch {
      // If a client-side SPA route has no extension, serve the app entrypoint.
      if (!path.extname(candidate) && request.method === 'GET') file = path.join(WEB_DIR, 'index.html');
      else return new Response('File not found', {status: 404});
    }
    try { return await net.fetch(pathToFileURL(file).toString()); }
    catch (err) { console.error('Local asset error:', err); return new Response('File not found', {status: 404}); }
  });
}

function installMenu(win) {
  const template = [
    {
      label: 'File',
      submenu: [
        {label: 'Home', accelerator: 'CmdOrCtrl+Shift+H', click: () => openHome(win)},
        {type: 'separator'},
        {role: 'quit'}
      ]
    },
    {label: 'Edit', submenu: [
      {role: 'undo'}, {role: 'redo'}, {type: 'separator'},
      {role: 'cut'}, {role: 'copy'}, {role: 'paste'}, {role: 'selectAll'}
    ]},
    {label: 'View', submenu: [
      {role: 'reload'}, {role: 'forceReload'}, {type: 'separator'},
      {role: 'resetZoom'}, {role: 'zoomIn'}, {role: 'zoomOut'},
      {type: 'separator'}, {role: 'togglefullscreen'}
    ]},
    {label: 'Help', submenu: [
      {label: 'About', click: () => dialog.showMessageBox(win, {
        type: 'info', title: 'About', message: settings.windowTitle || app.getName(),
        detail: `Version ${app.getVersion()}\nMade by Nitai Studio\nnitai.grp00@gmail.com`
      })}
    ]}
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function openHome(win) {
  if (remoteMode) win.loadURL(requestedRemote);
  else win.loadURL(`${LOCAL_ORIGIN}/index.html`);
}

function createWindow() {
  const win = new BrowserWindow({
    title: settings.windowTitle || app.getName(),
    width: settings.width || 1250,
    height: settings.height || 810,
    minWidth: settings.minWidth || 760,
    minHeight: settings.minHeight || 550,
    show: false,
    backgroundColor: '#0a1020',
    autoHideMenuBar: process.platform !== 'darwin',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
    }
  });

  win.webContents.setWindowOpenHandler(({url}) => {
    openExternal(url);
    return {action: 'deny'};
  });
  win.webContents.on('will-navigate', (event, destination) => {
    if (!isAllowedNavigation(destination)) {
      event.preventDefault();
      openExternal(destination);
    }
  });
  win.once('ready-to-show', () => win.show());
  win.webContents.on('did-fail-load', (_e, code, description, validatedURL, isMainFrame) => {
    if (isMainFrame) console.error('Page failed to load:', code, description, validatedURL);
  });
  installMenu(win);
  openHome(win);
  return win;
}

app.whenReady().then(() => {
  registerLocalFiles();
  // Explicit permissions: deny camera, microphone, location, etc. unless you add
  // the minimum permissions required by your PWA and your store listing.
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
