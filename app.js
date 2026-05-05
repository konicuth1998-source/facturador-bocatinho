const defaultClients = [
  {
    name: "Alhambra Café Bar",
    id: "1001242668-2",
    email: "anac7877@gmail.com",
    phone: "3117403247",
    address: "Ana María Morales Ramírez Cr 51 # 49-24 piso 2 Amagá Antioquia",
  },
  {
    name: "Antonio Ramírez 15322480",
    id: "medardoantony@hotmail.com 3147948294",
    email: "",
    phone: "",
    address: "Cra 60 A Calle 49 A-33",
  },
  {
    name: "Boom juice",
    id: "11935763499",
    email: "Loaizasalasm@gmail.com",
    phone: "3172443636",
    address: "María Fernanda Loaiza Cra 51 Cll 47a 42",
  },
  {
    name: "Fruver de todos",
    id: "98641325-5",
    email: "fruverdetodos@gmail.com",
    phone: "3137491969",
    address: "Carrera 57# 50-28",
  },
  {
    name: "Market 21",
    id: "1098755055-2",
    email: "Yahenypaolac@gmail.com",
    phone: "3042227929",
    address: "Cra 45# 50 50- 39",
  },
  {
    name: "Nelson Andres Vasquez Montoya",
    id: "1017194383",
    email: "andresvasquez0812l@gmail.com",
    phone: "3174133475",
    address: "cra 53 ·55 - 39",
  },
  {
    name: "Rubiel Taborda",
    id: "rubieltaborda81@gmail.com",
    email: "",
    phone: "3202872500",
    address: "Cra 87 n 39 - 127",
  },
  {
    name: "Nelson Jaramillo",
    id: "71368306",
    email: "jaramanson@gmail.com",
    phone: "3159276510",
    address: "Calle 57 # 69-27",
  },
  {
    name: "Sandra Milena Bedoya Arcila",
    id: "1035415500",
    email: "",
    phone: "",
    address: "x x",
  },
  {
    name: "Katerine Tangarife",
    id: "x",
    email: "x",
    phone: "x",
    address: "Cra 51 ·48a - 35",
  },
  {
    name: "Vanessa Gomez",
    id: "1035639091",
    email: "Vgomezfranco2@gmail.com",
    phone: "3006205733",
    address: "Colegio san Rafael copacabana",
  },
];

const defaultProducts = [
  { name: "Chicharrín limón", price: 2900 },
  { name: "Chicharrín natural", price: 2900 },
  { name: "Maduritos", price: 2900 },
  { name: "Maduritos limón", price: 2900 },
  { name: "Papas BBQ", price: 2900 },
  { name: "Papas BBQ dulce", price: 2900 },
  { name: "Papas limón", price: 2900 },
  { name: "Papas limón pimienta", price: 2900 },
  { name: "Papas mayonesa", price: 2900 },
  { name: "Papas miel", price: 2900 },
  { name: "Papas natural", price: 2900 },
  { name: "Papas pimienta", price: 2900 },
  { name: "Papas pimienta limón", price: 2900 },
  { name: "Plátano maduro", price: 2900 },
  { name: "Plátano maduro limón", price: 2900 },
  { name: "Plátano maduro natural", price: 2900 },
  { name: "Plátano verde", price: 2900 },
  { name: "Plátano verde limón", price: 2900 },
  { name: "Rosquillas", price: 2900 },
];

const defaults = {
  invoiceNumber: 109,
  invoiceDate: todayIso(),
  adjustment: 0,
  currentInvoiceId: "",
  selectedClient: "",
  selectedProduct: "",
  clientName: "",
  clientId: "",
  clientEmail: "",
  clientPhone: "",
  clientAddress: "",
  companyName: "Daniel Giraldo",
  companyId: "1035851120",
  companyEmail: "bocatinhosnacks@gmail.com",
  companyPhone: "301 8684553",
  companyAddress: "Cra 87 #39 127, Copacabana",
  notes: "",
  deletedProducts: [],
  invoices: [],
  clients: defaultClients,
  items: [
    { name: "Papas limón", price: 2900, quantity: 6 },
    { name: "Papas BBQ", price: 2900, quantity: 6 },
  ],
  products: defaultProducts,
};

const storageKey = "facturador-local-v1";
const fileStorageApi = `${window.location.origin}/api/state`;
const desktopApi = window.facturadorDesktop;
const clientFields = ["clientName", "clientId", "clientEmail", "clientPhone", "clientAddress"];
const fields = [
  "invoiceNumber",
  "invoiceDate",
  "adjustment",
  ...clientFields,
  "companyName",
  "companyId",
  "companyEmail",
  "companyPhone",
  "companyAddress",
  "notes",
];

let state = loadState();
let fileStorageEnabled = false;
let desktopStorageEnabled = false;

const money = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

function loadState() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return structuredClone(defaults);

  try {
    const parsed = JSON.parse(saved);
    const merged = { ...structuredClone(defaults), ...parsed };
    const deletedProducts = new Set((parsed.deletedProducts || []).map((name) => canonicalProductName(name).toLowerCase()));
    const visibleDefaultProducts = defaultProducts.filter(
      (product) => !deletedProducts.has(canonicalProductName(product.name).toLowerCase()),
    );
    const visibleSavedProducts = (parsed.products || []).filter(
      (product) => !deletedProducts.has(canonicalProductName(product.name).toLowerCase()),
    );
    merged.clients = mergeClients(defaultClients, parsed.clients || []);
    merged.deletedProducts = [...deletedProducts];
    merged.products = mergeProducts(visibleDefaultProducts, visibleSavedProducts);
    merged.items = normalizeItems(parsed.items || defaults.items);
    merged.invoices = normalizeInvoices(parsed.invoices || []);
    return merged;
  } catch {
    return structuredClone(defaults);
  }
}

function loadStateFromDisk() {
  if (desktopApi) {
    desktopApi
      .loadState()
      .then((desktopState) => {
        desktopStorageEnabled = true;
        state = normalizeLoadedState(desktopState);
        localStorage.setItem(storageKey, JSON.stringify(state));
        saveStateToDisk();
        render();
        setStatus("Datos cargados desde la app instalada.");
      })
      .catch(() => {
        desktopStorageEnabled = false;
      });
    return;
  }

  if (!window.location.protocol.startsWith("http")) return;

  fetch(fileStorageApi)
    .then((response) => {
      if (!response.ok) throw new Error("storage unavailable");
      return response.json();
    })
    .then((diskState) => {
      fileStorageEnabled = true;
      state = normalizeLoadedState(diskState);
      localStorage.setItem(storageKey, JSON.stringify(state));
      saveStateToDisk();
      render();
      setStatus("Datos cargados desde este PC.");
    })
    .catch(() => {
      fileStorageEnabled = false;
    });
}

function normalizeLoadedState(loadedState) {
  const parsed = loadedState || {};
  const merged = { ...structuredClone(defaults), ...parsed };
  const deletedProducts = new Set((parsed.deletedProducts || []).map((name) => canonicalProductName(name).toLowerCase()));
  const visibleDefaultProducts = defaultProducts.filter(
    (product) => !deletedProducts.has(canonicalProductName(product.name).toLowerCase()),
  );
  const visibleSavedProducts = (parsed.products || []).filter(
    (product) => !deletedProducts.has(canonicalProductName(product.name).toLowerCase()),
  );
  merged.clients = mergeClients(defaultClients, parsed.clients || []);
  merged.deletedProducts = [...deletedProducts];
  merged.products = mergeProducts(visibleDefaultProducts, visibleSavedProducts);
  merged.items = normalizeItems(parsed.items || defaults.items);
  merged.invoices = normalizeInvoices(parsed.invoices || []);
  return merged;
}

function normalizeInvoices(invoices) {
  return invoices
    .filter((invoice) => invoice && invoice.id)
    .map((invoice) => ({
      ...invoice,
      items: normalizeItems(invoice.items || []),
      total: parseNumber(invoice.total),
      updatedAt: invoice.updatedAt || invoice.createdAt || new Date().toISOString(),
      createdAt: invoice.createdAt || invoice.updatedAt || new Date().toISOString(),
    }))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

function normalizeItems(items) {
  return items.map((item) => ({
    ...canonicalProduct(item),
    quantity: Math.max(1, parseNumber(item.quantity) || 1),
  }));
}

function mergeProducts(baseProducts, savedProducts) {
  const products = new Map();
  [...baseProducts, ...savedProducts].forEach((product) => {
    if (!product.name) return;
    const normalized = canonicalProduct(product);
    const key = normalized.name.toLowerCase();
    const existing = products.get(key);
    if (!existing || normalized.price > existing.price) products.set(key, normalized);
  });
  return [...products.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));
}

function canonicalProduct(product) {
  const price = parseNumber(product.price);
  return {
    name: canonicalProductName(product.name),
    price: price === 2901 ? 2900 : price,
  };
}

function canonicalProductName(name) {
  const cleanName = name.trim().replace(/\s+/g, " ");
  const key = cleanName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (key.includes("chicarr") || key.includes("chicharr")) {
    return key.includes("natural") ? "Chicharrín natural" : "Chicharrín limón";
  }
  if (key.includes("rosquit") || key.includes("rosquill")) return "Rosquillas";
  if (key.includes("madurito") && key.includes("limon")) return "Maduritos limón";
  if (key.includes("madurito")) return "Maduritos";
  if ((key.includes("platano") || key.includes("plantano") || key.includes("patano")) && key.includes("maduro")) {
    if (key.includes("natural")) return "Plátano maduro natural";
    if (key.includes("limon")) return "Plátano maduro limón";
    return "Plátano maduro";
  }
  if (key.includes("platano") || key.includes("plantano") || key.includes("patano")) {
    if (key.includes("limon")) return "Plátano verde limón";
    return "Plátano verde";
  }
  if (key.includes("papa")) {
    if (key.includes("bbq") && key.includes("dulce")) return "Papas BBQ dulce";
    if (key.includes("bbq")) return "Papas BBQ";
    if (key.includes("mayonesa")) return "Papas mayonesa";
    if (key.includes("miel")) return "Papas miel";
    if (key.includes("natural")) return "Papas natural";
    if (key.includes("pimienta") && key.includes("limon")) return "Papas pimienta limón";
    if (key.includes("limon") && key.includes("pimienta")) return "Papas limón pimienta";
    if (key.includes("pimienta")) return "Papas pimienta";
    if (key.includes("limon")) return "Papas limón";
  }

  return cleanName;
}

function mergeClients(baseClients, savedClients) {
  const clients = [];
  [...baseClients, ...savedClients].forEach((client) => {
    if (!client.name) return;
    const existing = clients.find((item) => item.name.toLowerCase() === client.name.toLowerCase());
    if (existing) {
      Object.assign(existing, client);
    } else {
      clients.push({ ...client });
    }
  });
  return clients;
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
  saveStateToDisk();
}

function saveStateToDisk() {
  if (desktopStorageEnabled && desktopApi) {
    desktopApi.saveState(state).catch(() => {
      desktopStorageEnabled = false;
      setStatus("No pude guardar en los datos de la app. Se mantiene copia en el navegador.");
    });
    return;
  }

  if (!fileStorageEnabled) return;

  fetch(fileStorageApi, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state),
  }).catch(() => {
    fileStorageEnabled = false;
    setStatus("No pude guardar en el archivo del PC. Se mantiene copia en el navegador.");
  });
}

function setStatus(message) {
  const status = document.getElementById("statusMessage");
  status.textContent = message;
  if (!message) return;
  window.clearTimeout(setStatus.timer);
  setStatus.timer = window.setTimeout(() => {
    status.textContent = "";
  }, 4500);
}

function makeId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function safeFileName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function downloadJson(data, filename) {
  if (desktopApi) {
    desktopApi.saveJson({ filename, payload: data }).then((result) => {
      if (result?.ok) setStatus("Archivo guardado correctamente.");
    });
    return;
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function todayIso() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function totals() {
  const subtotal = state.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const adjustment = parseNumber(state.adjustment);
  return {
    subtotal,
    adjustment,
    total: subtotal + adjustment,
    quantity: state.items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

function currentInvoiceSnapshot() {
  const calculated = totals();
  const now = new Date().toISOString();
  const existing = state.invoices.find((invoice) => invoice.id === state.currentInvoiceId);

  return {
    id: state.currentInvoiceId || makeId(),
    number: parseNumber(state.invoiceNumber),
    date: state.invoiceDate,
    clientName: state.clientName.trim(),
    clientId: state.clientId.trim(),
    clientEmail: state.clientEmail.trim(),
    clientPhone: state.clientPhone.trim(),
    clientAddress: state.clientAddress.trim(),
    companyName: state.companyName.trim(),
    companyId: state.companyId.trim(),
    companyEmail: state.companyEmail.trim(),
    companyPhone: state.companyPhone.trim(),
    companyAddress: state.companyAddress.trim(),
    notes: state.notes,
    adjustment: parseNumber(state.adjustment),
    items: normalizeItems(state.items),
    subtotal: calculated.subtotal,
    total: calculated.total,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
}

function saveCurrentInvoice(showMessage = true) {
  const invoice = currentInvoiceSnapshot();
  const index = state.invoices.findIndex((item) => item.id === invoice.id);
  if (index >= 0) {
    state.invoices[index] = invoice;
  } else {
    state.invoices.unshift(invoice);
  }

  state.currentInvoiceId = invoice.id;
  state.invoices = normalizeInvoices(state.invoices);
  saveState();
  renderHistory();
  if (showMessage) setStatus(`Factura ${invoice.number} guardada.`);
  return invoice;
}

function loadInvoice(id) {
  const invoice = state.invoices.find((item) => item.id === id);
  if (!invoice) return;

  state.currentInvoiceId = invoice.id;
  state.invoiceNumber = invoice.number;
  state.invoiceDate = invoice.date;
  state.adjustment = invoice.adjustment;
  state.selectedClient = "";
  state.clientName = invoice.clientName || "";
  state.clientId = invoice.clientId || "";
  state.clientEmail = invoice.clientEmail || "";
  state.clientPhone = invoice.clientPhone || "";
  state.clientAddress = invoice.clientAddress || "";
  state.companyName = invoice.companyName || state.companyName;
  state.companyId = invoice.companyId || state.companyId;
  state.companyEmail = invoice.companyEmail || state.companyEmail;
  state.companyPhone = invoice.companyPhone || state.companyPhone;
  state.companyAddress = invoice.companyAddress || state.companyAddress;
  state.notes = invoice.notes || "";
  state.items = normalizeItems(invoice.items || []);
  saveState();
  render();
  setStatus(`Factura ${invoice.number} cargada.`);
}

function duplicateInvoice(id) {
  loadInvoice(id);
  state.currentInvoiceId = "";
  state.invoiceNumber = nextInvoiceNumber();
  state.invoiceDate = todayIso();
  saveState();
  render();
  setStatus("Factura duplicada como borrador nuevo.");
}

function deleteInvoice(id) {
  state.invoices = state.invoices.filter((invoice) => invoice.id !== id);
  if (state.currentInvoiceId === id) state.currentInvoiceId = "";
  saveState();
  renderHistory();
  setStatus("Factura eliminada del historial.");
}

function nextInvoiceNumber() {
  const historyMax = Math.max(0, ...state.invoices.map((invoice) => parseNumber(invoice.number)));
  return Math.max(parseNumber(state.invoiceNumber), historyMax) + 1;
}

function bindInputs() {
  fields.forEach((field) => {
    const input = document.getElementById(field);
    input.addEventListener("input", () => {
      state[field] = input.type === "number" ? parseNumber(input.value) : input.value;
      if (clientFields.includes(field)) state.selectedClient = "";
      state.currentInvoiceId = "";
      saveState();
      render();
    });
  });

  document.getElementById("clientSelect").addEventListener("change", (event) => {
    applyClient(event.target.value);
  });

  document.getElementById("productSelect").addEventListener("change", (event) => {
    applyProduct(event.target.value);
  });

  document.getElementById("historySearch").addEventListener("input", renderHistory);
}

function syncInputs() {
  fields.forEach((field) => {
    document.getElementById(field).value = state[field] ?? "";
  });
  document.getElementById("clientSelect").value = state.selectedClient || "";
  document.getElementById("productSelect").value = state.selectedProduct || "";
}

function currentClient() {
  return {
    name: state.clientName.trim(),
    id: state.clientId.trim(),
    email: state.clientEmail.trim(),
    phone: state.clientPhone.trim(),
    address: state.clientAddress.trim(),
  };
}

function applyClient(name) {
  const client = state.clients.find((item) => item.name === name);
  if (!client) {
    state.selectedClient = "";
    saveState();
    syncInputs();
    render();
    return;
  }

  state.selectedClient = client.name;
  state.clientName = client.name;
  state.clientId = client.id || "";
  state.clientEmail = client.email || "";
  state.clientPhone = client.phone || "";
  state.clientAddress = client.address || "";
  saveState();
  syncInputs();
  render();
}

function saveClient() {
  const client = currentClient();
  if (!client.name) return;

  const existing = state.clients.find((item) => item.name.toLowerCase() === client.name.toLowerCase());
  if (existing) {
    Object.assign(existing, client);
  } else {
    state.clients.push(client);
  }

  state.clients.sort((a, b) => a.name.localeCompare(b.name, "es"));
  state.selectedClient = client.name;
  saveState();
  render();
}

function deleteClient() {
  const client = currentClient();
  if (!client.name) return;
  state.clients = state.clients.filter((item) => item.name.toLowerCase() !== client.name.toLowerCase());
  state.selectedClient = "";
  saveState();
  render();
}

function addItem(product) {
  const normalized = canonicalProduct(product);
  const existing = state.items.find((item) => item.name === normalized.name && item.price === normalized.price);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.items.push({ name: normalized.name, price: normalized.price, quantity: 1 });
  }
  state.currentInvoiceId = "";
  saveState();
  render();
}

function renderClients() {
  const select = document.getElementById("clientSelect");
  const selected = state.selectedClient || "";
  select.innerHTML = '<option value="">Seleccionar cliente</option>';

  state.clients.forEach((client) => {
    const option = document.createElement("option");
    option.value = client.name;
    option.textContent = client.name;
    select.append(option);
  });

  select.value = selected;
}

function applyProduct(name) {
  const product = state.products.find((item) => item.name === name);
  state.selectedProduct = product ? product.name : "";

  document.getElementById("productName").value = product?.name || "";
  document.getElementById("productPrice").value = product?.price || "";
  saveState();
  syncInputs();
}

function renderProducts() {
  const select = document.getElementById("productSelect");
  const selected = state.selectedProduct || "";
  select.innerHTML = '<option value="">Seleccionar producto</option>';

  state.products.forEach((product) => {
    const option = document.createElement("option");
    option.value = product.name;
    option.textContent = `${product.name} - ${money.format(product.price)}`;
    select.append(option);
  });

  select.value = selected;
}

function renderHistory() {
  const container = document.getElementById("invoiceHistory");
  const counter = document.getElementById("historyCount");
  const query = document.getElementById("historySearch").value.trim().toLowerCase();
  const invoices = state.invoices.filter((invoice) => {
    const text = `${invoice.number} ${invoice.date} ${invoice.clientName} ${invoice.total}`.toLowerCase();
    return text.includes(query);
  });

  counter.textContent = `${state.invoices.length} guardadas`;
  container.innerHTML = "";

  if (!invoices.length) {
    const empty = document.createElement("p");
    empty.textContent = "No hay facturas guardadas.";
    container.append(empty);
    return;
  }

  invoices.slice(0, 30).forEach((invoice) => {
    const item = document.createElement("article");
    item.className = "history-item";
    item.innerHTML = `
      <strong>Factura ${invoice.number} - ${escapeHtml(invoice.clientName || "Sin cliente")}</strong>
      <p>${formatDate(invoice.date)} · ${money.format(invoice.total || 0)}</p>
      <div class="history-actions">
        <button type="button" data-action="load">Cargar</button>
        <button type="button" data-action="duplicate">Duplicar</button>
        <button type="button" data-action="delete">X</button>
      </div>
    `;

    item.querySelector('[data-action="load"]').addEventListener("click", () => loadInvoice(invoice.id));
    item.querySelector('[data-action="duplicate"]').addEventListener("click", () => duplicateInvoice(invoice.id));
    item.querySelector('[data-action="delete"]').addEventListener("click", () => deleteInvoice(invoice.id));
    container.append(item);
  });
}

function renderItemsEditor() {
  const container = document.getElementById("itemsEditor");
  container.innerHTML = "";

  if (!state.items.length) {
    const empty = document.createElement("p");
    empty.textContent = "Agrega productos con el selector de arriba.";
    container.append(empty);
    return;
  }

  state.items.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "item-line";
    row.innerHTML = `
      <label>Descripcion<input type="text" value="${escapeHtml(item.name)}" data-field="name"></label>
      <label>Cantidad<input type="number" min="1" value="${item.quantity}" data-field="quantity"></label>
      <label>Precio<input type="number" min="0" step="100" value="${item.price}" data-field="price"></label>
      <button class="remove" type="button" aria-label="Quitar producto">X</button>
    `;

    row.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", () => {
        const field = input.dataset.field;
        item[field] = field === "name" ? input.value : parseNumber(input.value);
        state.currentInvoiceId = "";
        saveState();
        render();
      });
    });

    row.querySelector(".remove").addEventListener("click", () => {
      state.items.splice(index, 1);
      state.currentInvoiceId = "";
      saveState();
      render();
    });

    container.append(row);
  });
}

function renderInvoiceItems() {
  const body = document.getElementById("invoiceItems");
  body.innerHTML = "";

  state.items.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(item.name)}</td>
      <td>${item.quantity}</td>
      <td>${money.format(item.price)}</td>
      <td>${money.format(item.quantity * item.price)}</td>
    `;
    body.append(row);
  });
}

function renderBindings() {
  const calculated = totals();
  const values = {
    ...state,
    invoiceDate: formatDate(state.invoiceDate),
    subtotal: money.format(calculated.subtotal),
    adjustment: money.format(calculated.adjustment),
    total: money.format(calculated.total),
    quantity: calculated.quantity || "",
  };

  document.querySelectorAll("[data-bind]").forEach((node) => {
    node.textContent = values[node.dataset.bind] ?? "";
  });
}

function render() {
  renderClients();
  renderProducts();
  renderItemsEditor();
  renderInvoiceItems();
  renderBindings();
  renderHistory();
  syncInputs();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function backupPayload() {
  return {
    app: "facturador-local-bocatinho",
    version: 2,
    exportedAt: new Date().toISOString(),
    state,
  };
}

function exportAllData() {
  const filename = `respaldo-facturador-${todayIso()}.json`;
  downloadJson(backupPayload(), filename);
  setStatus("Respaldo completo exportado.");
}

function exportCurrentInvoice() {
  const invoice = saveCurrentInvoice(false);
  const client = safeFileName(invoice.clientName || "sin-cliente");
  downloadJson(
    {
      app: "facturador-local-bocatinho",
      type: "invoice",
      version: 2,
      exportedAt: new Date().toISOString(),
      invoice,
    },
    `factura-${invoice.number}-${client}.json`,
  );
  setStatus(`Factura ${invoice.number} exportada.`);
}

function importPayload(payload) {
  if (payload?.type === "invoice" && payload.invoice) {
    state.invoices = normalizeInvoices([payload.invoice, ...state.invoices]);
    saveState();
    render();
    setStatus(`Factura ${payload.invoice.number} importada.`);
    return;
  }

  const importedState = payload?.state || payload;
  if (!importedState || typeof importedState !== "object") {
    setStatus("El archivo no parece ser un respaldo valido.");
    return;
  }

  state = {
    ...structuredClone(defaults),
    ...importedState,
    clients: mergeClients(defaultClients, importedState.clients || []),
    products: mergeProducts(defaultProducts, importedState.products || []),
    items: normalizeItems(importedState.items || []),
    invoices: normalizeInvoices(importedState.invoices || []),
    deletedProducts: importedState.deletedProducts || [],
  };
  saveState();
  render();
  setStatus("Respaldo importado correctamente.");
}

function importDataFile(file) {
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      importPayload(JSON.parse(reader.result));
    } catch {
      setStatus("No pude leer ese archivo JSON.");
    }
  });
  reader.readAsText(file);
}

function importDataFromDesktop() {
  if (!desktopApi) {
    document.getElementById("importFile").click();
    return;
  }

  desktopApi
    .openJson()
    .then((result) => {
      if (result?.ok) importPayload(result.payload);
    })
    .catch(() => {
      setStatus("No pude importar ese archivo.");
    });
}

document.getElementById("addCustomItem").addEventListener("click", () => {
  const name = document.getElementById("productName").value.trim();
  const price = parseNumber(document.getElementById("productPrice").value);
  if (!name) return;
  addItem({ name, price });
});

document.getElementById("saveProduct").addEventListener("click", () => {
  const name = document.getElementById("productName").value.trim();
  const price = parseNumber(document.getElementById("productPrice").value);
  if (!name) return;

  const product = canonicalProduct({ name, price });
  const existing = state.products.find((item) => item.name.toLowerCase() === product.name.toLowerCase());
  if (existing) {
    existing.price = product.price;
  } else {
    state.products.push(product);
  }

  state.products = mergeProducts([], state.products);
  state.deletedProducts = (state.deletedProducts || []).filter((name) => name !== product.name.toLowerCase());
  state.selectedProduct = product.name;
  saveState();
  render();
});

document.getElementById("addSelectedProduct").addEventListener("click", () => {
  const product = state.products.find((item) => item.name === state.selectedProduct);
  if (product) addItem(product);
});

document.getElementById("deleteProduct").addEventListener("click", () => {
  const name = state.selectedProduct || document.getElementById("productName").value.trim();
  if (!name) return;
  const canonicalName = canonicalProductName(name).toLowerCase();
  state.products = state.products.filter((product) => product.name.toLowerCase() !== canonicalName);
  state.deletedProducts = [...new Set([...(state.deletedProducts || []), canonicalName])];
  state.selectedProduct = "";
  document.getElementById("productName").value = "";
  document.getElementById("productPrice").value = "";
  saveState();
  render();
});

document.getElementById("saveClient").addEventListener("click", saveClient);
document.getElementById("deleteClient").addEventListener("click", deleteClient);

document.getElementById("newInvoice").addEventListener("click", () => {
  state.currentInvoiceId = "";
  state.invoiceNumber = nextInvoiceNumber();
  state.invoiceDate = todayIso();
  state.selectedClient = "";
  state.clientName = "";
  state.clientId = "";
  state.clientEmail = "";
  state.clientPhone = "";
  state.clientAddress = "";
  state.adjustment = 0;
  state.notes = "";
  state.items = [];
  saveState();
  render();
});

document.getElementById("saveInvoice").addEventListener("click", () => {
  saveCurrentInvoice();
});

document.getElementById("printInvoice").addEventListener("click", () => {
  const invoice = saveCurrentInvoice(false);
  const client = safeFileName(invoice.clientName || "sin-cliente");
  document.title = `Factura-${invoice.number}-${client}`;
  window.print();
});

document.getElementById("exportData").addEventListener("click", exportAllData);
document.getElementById("exportInvoice").addEventListener("click", exportCurrentInvoice);
document.getElementById("importData").addEventListener("click", () => {
  importDataFromDesktop();
});
document.getElementById("importFile").addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (file) importDataFile(file);
  event.target.value = "";
});

if (desktopApi) {
  const openDataFolder = document.getElementById("openDataFolder");
  openDataFolder.hidden = false;
  openDataFolder.addEventListener("click", () => {
    desktopApi.revealData();
  });
}

bindInputs();
render();
loadStateFromDisk();
