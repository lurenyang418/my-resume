import type { ResumeData } from "@/types/resume";
import { sanitizeResumeData } from "@/lib/resumeData";

const DB_NAME = "FileHandleDB";
const HANDLE_STORE = "handles";
const CONFIG_STORE = "config";
const DB_VERSION = 2;

let db: IDBDatabase | null = null;

const initDB = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve();
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const requestDb = (event.target as IDBOpenDBRequest).result;
      if (!requestDb.objectStoreNames.contains(HANDLE_STORE)) {
        requestDb.createObjectStore(HANDLE_STORE);
      }
      if (!requestDb.objectStoreNames.contains(CONFIG_STORE)) {
        requestDb.createObjectStore(CONFIG_STORE);
      }
    };
  });
};

export const storeFileHandle = async (
  key: string,
  handle: FileSystemHandle
): Promise<void> => {
  await initDB();
  if (!db) throw new Error("Database not initialized");

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(HANDLE_STORE, "readwrite");
    const store = transaction.objectStore(HANDLE_STORE);
    const request = store.put(handle, key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export const getFileHandle = async (
  key: string
): Promise<FileSystemHandle | null> => {
  await initDB();
  if (!db) throw new Error("Database not initialized");

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(HANDLE_STORE, "readonly");
    const store = transaction.objectStore(HANDLE_STORE);
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const storeConfig = async (key: string, value: any): Promise<void> => {
  await initDB();
  if (!db) throw new Error("Database not initialized");

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(CONFIG_STORE, "readwrite");
    const store = transaction.objectStore(CONFIG_STORE);
    const request = store.put(value, key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export const getConfig = async (key: string): Promise<any> => {
  await initDB();
  if (!db) throw new Error("Database not initialized");

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(CONFIG_STORE, "readonly");
    const store = transaction.objectStore(CONFIG_STORE);
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

type FileSystemPermissionMode = "read" | "readwrite";

export const verifyPermission = async (
  handle: FileSystemHandle,
  mode: FileSystemPermissionMode = "readwrite"
): Promise<boolean> => {
  if (!handle) {
    return false;
  }

  const opts: FileSystemPermissionDescriptor = { mode };

  if (await handle.queryPermission(opts) === "granted") {
    return true;
  }

  if (await handle.requestPermission(opts) === "granted") {
    return true;
  }

  return false;
};

export const writeResumeToDirectory = async (
  directoryHandle: FileSystemDirectoryHandle,
  resume: ResumeData
): Promise<void> => {
  const fileHandle = await directoryHandle.getFileHandle(`${resume.id}.json`, {
    create: true,
  });
  const writable = await fileHandle.createWritable();
  try {
    await writable.write(JSON.stringify(sanitizeResumeData(resume), null, 2));
    await writable.close();
  } catch (error) {
    await writable.abort().catch(() => undefined);
    throw error;
  }
};
