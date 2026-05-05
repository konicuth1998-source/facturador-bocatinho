const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("facturadorDesktop", {
  loadState: () => ipcRenderer.invoke("storage:load"),
  saveState: (payload) => ipcRenderer.invoke("storage:save", payload),
  dataPath: () => ipcRenderer.invoke("storage:path"),
  revealData: () => ipcRenderer.invoke("storage:reveal"),
  revealBackups: () => ipcRenderer.invoke("storage:reveal-backups"),
  openReleases: () => ipcRenderer.invoke("app:open-releases"),
  saveJson: (options) => ipcRenderer.invoke("dialog:save-json", options),
  openJson: () => ipcRenderer.invoke("dialog:open-json"),
});
