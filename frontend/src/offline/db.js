const DB_NAME = 'yala_offline';
const DB_VERSION = 1;
const STORE = 'cola_ventas';

function abrirDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function conTienda(modo, fn) {
  const db = await abrirDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, modo);
    const store = tx.objectStore(STORE);
    const resultado = fn(store);
    tx.oncomplete = () => resolve(resultado);
    tx.onerror = () => reject(tx.error);
  });
}

export async function encolarVenta(payload) {
  const item = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    payload,
    timestamp: Date.now(),
    estado: 'pendiente',
    mensaje: null,
  };
  await conTienda('readwrite', (store) => store.add(item));
  return item;
}

export async function obtenerCola() {
  const db = await abrirDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const store = tx.objectStore(STORE);
    const index = store.index('timestamp');
    const req = index.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function actualizarItem(id, cambios) {
  await conTienda('readwrite', (store) => {
    const req = store.get(id);
    req.onsuccess = () => {
      if (req.result) {
        store.put({ ...req.result, ...cambios });
      }
    };
  });
}

export async function eliminarItem(id) {
  await conTienda('readwrite', (store) => store.delete(id));
}
