const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('munjez', {
  getState: () => ipcRenderer.invoke('get-state'),
  save: (s) => ipcRenderer.send('save', s),
  ignore: (v) => ipcRenderer.send('ignore', v),
  setSide: (side) => ipcRenderer.send('set-side', side),
  moveTo: (x, y, offset) => ipcRenderer.invoke('move-to', x, y, offset),
  setAutostart: (v) => ipcRenderer.invoke('set-autostart', v),
  setShortcut: (acc) => ipcRenderer.invoke('set-shortcut', acc),
  pauseShortcut: () => ipcRenderer.send('pause-shortcut'),
  notify: (title, body) => ipcRenderer.send('notify', title, body),
  focus: () => ipcRenderer.send('focus'),
  blur: () => ipcRenderer.send('blur'),
  openData: () => ipcRenderer.send('open-data'),
  quit: () => ipcRenderer.send('quit'),
  onCmd: (fn) => ipcRenderer.on('cmd', (_e, c) => fn(c)),
});
