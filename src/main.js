const {
  app, BrowserWindow, ipcMain, screen, globalShortcut, Tray, Menu, Notification, shell,
} = require('electron');
const path = require('path');
const fs = require('fs');

// النافذة شفافة وتغطي ارتفاع الشاشة كامل على الحافة، والنقرات تعبر منها إلا فوق عناصر التطبيق
const WIN_W = 400;
const ICON = path.join(__dirname, '..', 'assets', 'icon.png');
const TRAY_ICON = path.join(__dirname, '..', 'assets', 'icon-32.png');

app.commandLine.appendSwitch('lang', 'en-US'); // أرقام إنجليزية في حقول الوقت
app.setAppUserModelId('sa.faris.munjez');

let win = null;
let tray = null;
let dataFile = '';
let state = null;
let shortcut = '';

// مجلد بيانات للتجربة: قبل قفل النسخة الواحدة عشان ما يتعارض مع النسخة المثبتة
const testDir = process.argv.find((a) => a.startsWith('--data-dir='));
if (testDir) app.setPath('userData', testDir.slice(11));

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => openPanel('open'));
  app.whenReady().then(init);
}

function readJSON(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

function loadState() {
  return readJSON(dataFile) || readJSON(dataFile + '.bak');
}

function saveState(s) {
  state = s;
  const tmp = dataFile + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(s));
  if (fs.existsSync(dataFile)) fs.copyFileSync(dataFile, dataFile + '.bak');
  fs.renameSync(tmp, dataFile);
}

const settings = () => (state && state.settings) || {};

function loginArgs() {
  return app.isPackaged ? [] : [app.getAppPath()];
}

function getAutostart() {
  return app.getLoginItemSettings({ path: process.execPath, args: loginArgs() }).openAtLogin;
}

function setAutostart(on) {
  app.setLoginItemSettings({ openAtLogin: on, path: process.execPath, args: loginArgs() });
  return getAutostart();
}

// الشاشة المحفوظة، وإذا انفصلت نرجع للرئيسية
function display() {
  return screen.getAllDisplays().find((d) => d.id === settings().display) || screen.getPrimaryDisplay();
}

function place() {
  if (!win) return;
  const area = display().workArea;
  const left = settings().side === 'left';
  win.setBounds({
    x: left ? area.x : area.x + area.width - WIN_W,
    y: area.y,
    width: WIN_W,
    height: area.height,
  });
}

function registerShortcut(acc) {
  globalShortcut.unregisterAll();
  shortcut = '';
  if (!acc) return true;
  try {
    const ok = globalShortcut.register(acc, () => openPanel('add'));
    if (ok) shortcut = acc;
    return ok;
  } catch {
    return false;
  }
}

function openPanel(cmd) {
  if (!win) return;
  win.setFocusable(true);
  win.showInactive();
  win.focus();
  win.webContents.send('cmd', cmd);
}

function createTray() {
  tray = new Tray(TRAY_ICON);
  tray.setToolTip('مُنجز');
  const menu = () => Menu.buildFromTemplate([
    { label: 'فتح القائمة', click: () => openPanel('open') },
    { label: 'إضافة مهمة', click: () => openPanel('add') },
    { label: 'الإحصائيات', click: () => openPanel('stats') },
    { label: 'نقل الشريط للجهة الثانية', click: () => win.webContents.send('cmd', 'flip') },
    { type: 'separator' },
    {
      label: 'التشغيل مع ويندوز', type: 'checkbox', checked: getAutostart(),
      click: (item) => setAutostart(item.checked),
    },
    { type: 'separator' },
    { label: 'خروج', click: () => app.quit() },
  ]);
  tray.on('click', () => openPanel('open'));
  tray.on('right-click', () => tray.popUpContextMenu(menu()));
}

function init() {
  dataFile = path.join(app.getPath('userData'), 'munjez-data.json');
  state = loadState();

  // أول تشغيل: نفعّل التشغيل التلقائي مع ويندوز
  if (!state && app.isPackaged && !testDir) setAutostart(true);

  win = new BrowserWindow({
    width: WIN_W,
    height: 600,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: false,
    focusable: false,
    show: false,
    icon: ICON,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
      spellcheck: false,
    },
  });
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setIgnoreMouseEvents(true, { forward: true });
  win.setMenu(null);
  place();
  win.loadFile(path.join(__dirname, 'index.html'), { hash: process.argv.includes('--panel') ? 'panel' : '' });
  win.once('ready-to-show', () => win.showInactive());

  screen.on('display-metrics-changed', place);
  screen.on('display-added', place);
  screen.on('display-removed', place);

  registerShortcut(settings().shortcut || 'Ctrl+Alt+N');
  createTray();

  // لقطة شاشة للتجربة: electron . --snap=out.png
  const snap = process.argv.find((a) => a.startsWith('--snap='));
  if (snap) {
    win.webContents.once('did-finish-load', () => setTimeout(async () => {
      const run = process.argv.find((a) => a.startsWith('--run='));
      if (run) {
        await win.webContents.executeJavaScript(fs.readFileSync(run.slice(6), 'utf8'));
        await new Promise((r) => setTimeout(r, 700));
      }
      const img = await win.webContents.capturePage();
      fs.writeFileSync(snap.slice(7), img.toPNG());
      if (process.argv.includes('--exit')) app.quit();
    }, 1500));
  }
}

ipcMain.handle('get-state', () => ({ state, autostart: getAutostart(), shortcut }));
ipcMain.on('save', (_e, s) => saveState(s));
ipcMain.on('ignore', (_e, v) => win && win.setIgnoreMouseEvents(v, { forward: true }));
ipcMain.on('set-side', (_e, side) => {
  state = { ...state, settings: { ...settings(), side } };
  place();
});
// إفلات الشريط بعد سحبه لداخل الشاشة: ينتقل للحافة الثانية،
// وإذا أفلته فوق شاشة ثانية ينتقل لأقرب حافة فيها
ipcMain.handle('move-to', (_e, x, y, offset) => {
  const d = screen.getDisplayNearestPoint({ x: Math.round(x), y: Math.round(y) });
  const area = d.workArea;
  const side = d.id === display().id
    ? (settings().side === 'left' ? 'right' : 'left')
    : (x < area.x + area.width / 2 ? 'left' : 'right');
  state = { ...state, settings: { ...settings(), side, display: d.id } };
  place();
  return { side, display: d.id, y: Math.round(y - area.y - offset) };
});
ipcMain.handle('set-autostart', (_e, v) => setAutostart(v));
ipcMain.handle('set-shortcut', (_e, acc) => {
  const prev = settings().shortcut || 'Ctrl+Alt+N';
  const ok = registerShortcut(acc);
  if (!ok) registerShortcut(prev);
  return ok;
});
ipcMain.on('pause-shortcut', () => globalShortcut.unregisterAll());
ipcMain.on('notify', (_e, title, body) => {
  if (!Notification.isSupported()) return;
  const n = new Notification({ title, body, icon: ICON });
  n.on('click', () => openPanel('open'));
  n.show();
});
ipcMain.on('focus', () => {
  if (!win) return;
  win.setFocusable(true);
  win.focus();
});
ipcMain.on('blur', () => {
  if (!win) return;
  win.blur();
  win.setFocusable(false);
});
ipcMain.on('open-data', () => shell.showItemInFolder(dataFile));
ipcMain.on('quit', () => app.quit());

app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', () => app.quit());
