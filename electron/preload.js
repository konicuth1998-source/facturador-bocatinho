const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("facturadorDesktop", {
  loadState: () => ipcRenderer.invoke("storage:load"),
  saveState: (payload) => ipcRenderer.invoke("storage:save", payload),
  dataPath: () => ipcRenderer.invoke("storage:path"),
  revealData: () => ipcRenderer.invoke("storage:reveal"),
  saveJson: (options) => ipcRenderer.invoke("dialog:save-json", options),
  openJson: () => ipcRenderer.invoke("dialog:open-json"),
});
