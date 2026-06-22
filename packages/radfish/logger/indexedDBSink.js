/**
 * indexedDBSink.js — configurable IndexedDB persistence for the Logger.
 *
 * `createIndexedDBSink({ dbName, maxSize })` returns a sink (a `write`/`close`
 * object the Logger dispatches to) that ALSO exposes helpers to read/clear the
 * persisted data, so the app can hydrate previous-session logs on startup:
 *
 *   const sink = createIndexedDBSink({ dbName: "my-app-logs", maxSize: "5MB" });
 *   await sink.loadLogs();          // previous-session log records
 *   await sink.clearLogs();
 *   await sink.saveDiagnostic({ kind, stream, reason, timestamp });
 *   await sink.loadDiagnostics();   // metadata-only logger events
 *
 * Two object stores per database:
 *   - "logs"        — full log records that reached the sinks.
 *   - "diagnostics" — the logger's OWN events (drops/errors/lifecycle) as
 *                     METADATA ONLY ({ kind, stream, reason, timestamp }). A
 *                     dropped/errored record's payload is never stored, so a
 *                     redacted secret can't be re-persisted here.
 *
 * Each store is auto-trimmed to the `maxSize` storage budget (oldest records
 * evicted first) so it can't grow without bound. `maxSize` is human-friendly:
 * a string like "5MB" / "500KB" / "1GB", or a raw number of bytes. Units are
 * binary (1KB = 1024 bytes). Instance-scoped by `dbName`, so multiple databases
 * never collide.
 */

const LOGS = "logs";
const DIAGNOSTICS = "diagnostics";
const VERSION = 1;
const DEFAULT_MAX_SIZE = "5MB"; // per store

const hasIDB = () => typeof indexedDB !== "undefined";

// Serialized UTF-8 size of a record — what it actually costs on disk.
const encoder = new TextEncoder();
const byteSize = (item) => encoder.encode(JSON.stringify(item)).length;

// Parse a human-friendly size into bytes. Accepts a number (already bytes) or a
// string like "5MB", "500 kb", "1.5gb". Binary units (1KB = 1024 bytes).
const SIZE_UNITS = { b: 1, kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3 };
function parseSize(value) {
  if (typeof value === "number") return value;
  const match = /^\s*([\d.]+)\s*(b|kb|mb|gb)?\s*$/i.exec(String(value));
  if (!match) {
    throw new Error(`Invalid maxSize: "${value}". Use a string like "5MB"/"500KB" or a number of bytes.`);
  }
  return Math.round(parseFloat(match[1]) * SIZE_UNITS[(match[2] || "b").toLowerCase()]);
}

function openDB(dbName) {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const name of [LOGS, DIAGNOSTICS]) {
        if (!db.objectStoreNames.contains(name)) {
          const store = db.createObjectStore(name, { keyPath: "_id", autoIncrement: true });
          store.createIndex("timestamp", "timestamp");
        }
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function txDone(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

// Evict oldest records until the store's total serialized size fits maxBytes.
// Records come back keyed oldest-first (autoIncrement _id), so we drop from the
// front. The most recent record is always kept, even if it alone exceeds budget.
async function trim(db, storeName, maxBytes) {
  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  const items = await new Promise((resolve, reject) => {
    const r = store.getAll();
    r.onsuccess = () => resolve(r.result || []);
    r.onerror = () => reject(r.error);
  });
  let total = items.reduce((sum, it) => sum + byteSize(it), 0);
  let i = 0;
  while (total > maxBytes && i < items.length - 1) {
    store.delete(items[i]._id);
    total -= byteSize(items[i]);
    i++;
  }
  await txDone(tx);
}

async function addTo(db, storeName, item, maxBytes) {
  const tx = db.transaction(storeName, "readwrite");
  tx.objectStore(storeName).add(item);
  await txDone(tx);
  if (maxBytes) await trim(db, storeName, maxBytes);
}

function getAllFrom(db, storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const r = tx.objectStore(storeName).getAll();
    r.onsuccess = () => resolve(r.result || []);
    r.onerror = () => reject(r.error);
  });
}

async function clearStore(db, storeName) {
  const tx = db.transaction(storeName, "readwrite");
  tx.objectStore(storeName).clear();
  await txDone(tx);
}

export function createIndexedDBSink({ dbName = "radfish-logs", maxSize = DEFAULT_MAX_SIZE } = {}) {
  const maxBytes = parseSize(maxSize);
  let dbPromise;
  const db = () => (dbPromise ||= openDB(dbName));

  return {
    dbName,
    // --- Logger sink contract ---
    write: async (record) => {
      if (!hasIDB()) return;
      const { _fromStorage, _id, ...clean } = record; // strip UI/key-only fields
      await addTo(await db(), LOGS, clean, maxBytes);
    },
    close: async ({ purge } = {}) => {
      if (purge && hasIDB()) await clearStore(await db(), LOGS);
    },
    // --- persistence helpers (for hydration / clearing from the app) ---
    loadLogs: async () => (hasIDB() ? getAllFrom(await db(), LOGS) : []),
    clearLogs: async () => {
      if (hasIDB()) await clearStore(await db(), LOGS);
    },
    saveDiagnostic: async (meta) => {
      if (!hasIDB()) return;
      const { kind, stream, reason, timestamp } = meta; // metadata only — never a payload
      await addTo(await db(), DIAGNOSTICS, { kind, stream, reason: reason ?? null, timestamp }, maxBytes);
    },
    loadDiagnostics: async () => (hasIDB() ? getAllFrom(await db(), DIAGNOSTICS) : []),
    clearDiagnostics: async () => {
      if (hasIDB()) await clearStore(await db(), DIAGNOSTICS);
    },
  };
}
