const { app, BrowserWindow, dialog, ipcMain, shell } = require("electron");
const fs = require("fs");
const path = require("path");

const appRoot = path.join(__dirname, "..");
const dataDir = () => path.join(app.getPath("userData"), "data");
const dataFile = () => path.join(dataDir(), "facturador-data.json");
const appIcon = () => {
  const pngIcon = path.join(appRoot, "build", "icon.png");
  return fs.existsSync(pngIcon) ? pngIcon : path.join(appRoot, "assets", "logo.jpeg");
};

app.disableHardwareAcceleration();

function ensureDataDir() {
  fs.mkdirSync(dataDir(), { recursive: true });
}

function readData() {
  ensureDataDir();
  const file = dataFile();
  if (!fs.existsSync(file)) return {};

  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    const backup = `${file}.corrupt-${Date.now()}`;
    fs.renameSync(file, backup);
    return {};
  }
}

function writeData(payload) {
  ensureDataDir();
  const tempFile = `${dataFile()}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(payload, null, 2), "utf8");
  fs.renameSync(tempFile, dataFile());
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 1040,
    minHeight: 720,
    title: "Facturador Bocatinho",
    icon: appIcon(),
    backgroundColor: "#f4f2ee",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(appRoot, "index.html"));
}

app.whenReady().then(() => {
  ipcMain.handle("storage:load", () => readData());
  ipcMain.handle("storage:save", (_event, payload) => {
    writeData(payload);
    return { ok: true };
  });
  ipcMain.handle("storage:path", () => dataFile());
  ipcMain.handle("storage:reveal", () => {
    ensureDataDir();
    shell.openPath(dataDir());
    return { ok: true };
  });
  ipcMain.handle("dialog:save-json", async (_event, { filename, payload }) => {
    const result = await dialog.showSaveDialog({
      defaultPath: filename,
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    if (result.canceled || !result.filePath) return { canceled: true };
    fs.writeFileSync(result.filePath, JSON.stringify(payload, null, 2), "utf8");
    return { ok: true, filePath: result.filePath };
  });
  ipcMain.handle("dialog:open-json", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    if (result.canceled || !result.filePaths.length) return { canceled: true };
    return {
      ok: true,
      filePath: result.filePaths[0],
      payload: JSON.parse(fs.readFileSync(result.filePaths[0], "utf8")),
    };
  });

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
