import type { ContributionDraft } from './types';

// Minimal IndexedDB layer for contribution drafts. No external dependency —
// raw IndexedDB wrapped in promises. Two object stores:
//   - `drafts`: one ContributionDraft per key (`id`). JSON only, no binaries.
//   - `blobs`:  screenshot binaries, keyed by the DraftScreenshot `id`, with a
//               `draftId` index so a draft's images can be loaded / purged
//               together.

const DB_NAME = 'ade-arena-contrib';
const DB_VERSION = 1;
const DRAFTS = 'drafts';
const BLOBS = 'blobs';

type BlobRecord = {
  id: string;
  draftId: string;
  blob: Blob;
};

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DRAFTS)) {
        db.createObjectStore(DRAFTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(BLOBS)) {
        const store = db.createObjectStore(BLOBS, { keyPath: 'id' });
        store.createIndex('draftId', 'draftId', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'));
  });
  return dbPromise;
}

function tx<T>(
  store: string,
  mode: IDBTransactionMode,
  run: (s: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(store, mode);
        const request = run(transaction.objectStore(store));
        transaction.oncomplete = () => resolve(request.result);
        transaction.onerror = () => reject(transaction.error ?? request.error);
        transaction.onabort = () => reject(transaction.error ?? new Error('Transaction aborted'));
      }),
  );
}

// ----- Drafts -------------------------------------------------------------

export async function saveDraft(draft: ContributionDraft): Promise<void> {
  await tx(DRAFTS, 'readwrite', (s) => s.put(draft));
}

export async function loadDraft(id: string): Promise<ContributionDraft | undefined> {
  return tx<ContributionDraft | undefined>(DRAFTS, 'readonly', (s) => s.get(id));
}

export async function listDrafts(): Promise<ContributionDraft[]> {
  const all = await tx<ContributionDraft[]>(DRAFTS, 'readonly', (s) => s.getAll());
  return [...all].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function deleteDraft(id: string): Promise<void> {
  await tx(DRAFTS, 'readwrite', (s) => s.delete(id));
  await deleteBlobsForDraft(id);
}

// ----- Screenshot blobs ---------------------------------------------------

export async function putBlob(id: string, draftId: string, blob: Blob): Promise<void> {
  const record: BlobRecord = { id, draftId, blob };
  await tx(BLOBS, 'readwrite', (s) => s.put(record));
}

export async function getBlob(id: string): Promise<Blob | undefined> {
  const record = await tx<BlobRecord | undefined>(BLOBS, 'readonly', (s) => s.get(id));
  return record?.blob;
}

export async function deleteBlob(id: string): Promise<void> {
  await tx(BLOBS, 'readwrite', (s) => s.delete(id));
}

async function deleteBlobsForDraft(draftId: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(BLOBS, 'readwrite');
    const index = transaction.objectStore(BLOBS).index('draftId');
    const cursorReq = index.openCursor(IDBKeyRange.only(draftId));
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}
