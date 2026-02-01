const DB_NAME = 'IronLogDB';
const STORE_NAME = 'handles';
const KEY = 'exportDirectoryHandle'; // Changed key to reflect directory

// Define interfaces for File System Access API (Directory support)
interface FileSystemHandle {
  kind: 'file' | 'directory';
  name: string;
  queryPermission(descriptor: { mode: 'read' | 'readwrite' }): Promise<'granted' | 'denied' | 'prompt'>;
  requestPermission(descriptor: { mode: 'read' | 'readwrite' }): Promise<'granted' | 'denied' | 'prompt'>;
}

interface FileSystemFileHandle extends FileSystemHandle {
  kind: 'file';
  createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemDirectoryHandle extends FileSystemHandle {
  kind: 'directory';
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
}

interface FileSystemWritableFileStream {
  write(data: any): Promise<void>;
  close(): Promise<void>;
}

export const getStoredDirectoryHandle = async (): Promise<FileSystemDirectoryHandle | null> => {
  if (typeof indexedDB === 'undefined') return null;
  
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(KEY);

      getRequest.onsuccess = () => {
        resolve(getRequest.result as FileSystemDirectoryHandle || null);
      };

      getRequest.onerror = () => {
        console.error('Error getting handle', getRequest.error);
        resolve(null);
      };
    };

    request.onerror = () => {
      console.error('Error opening DB', request.error);
      resolve(null);
    };
  });
};

export const storeDirectoryHandle = async (handle: FileSystemDirectoryHandle): Promise<void> => {
  if (typeof indexedDB === 'undefined') return;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const putRequest = store.put(handle, KEY);

      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };
    
    request.onerror = () => reject(request.error);
  });
};

export const clearStoredDirectoryHandle = async (): Promise<void> => {
    if (typeof indexedDB === 'undefined') return;

    return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.delete(KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    };
    
    request.onerror = () => reject(request.error);
  });
};