export const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const DATABASE = 'invia-local-drafts';
export type LocalDraft = {
  id: string;
  owner: string;
  path: string;
  modifiedAt: number;
  payload: unknown;
};

function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => {
      request.result
        .createObjectStore('drafts', { keyPath: 'id' })
        .createIndex('owner', 'owner');
      request.result.createObjectStore('epochs');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () =>
      reject(
        new Error(
          '초안 저장소를 열 수 없습니다. 다른 탭을 닫고 다시 시도해 주세요.'
        )
      );
  });
}

export async function readLocalDraft(owner: string, path: string) {
  const db = await database();
  return new Promise<{ draft: LocalDraft | null; epoch: number }>(
    (resolve, reject) => {
      const transaction = db.transaction(['drafts', 'epochs'], 'readwrite');
      const drafts = transaction.objectStore('drafts');
      let draft: LocalDraft | null = null;
      let epoch = 0;
      const cursor = drafts.openCursor();
      cursor.onsuccess = () => {
        const current = cursor.result;
        if (!current) return;
        const value = current.value as LocalDraft;
        if (value.modifiedAt <= Date.now() - DRAFT_MAX_AGE_MS) current.delete();
        else if (value.owner === owner && value.path === path) draft = value;
        current.continue();
      };
      const epochRequest = transaction.objectStore('epochs').get(owner);
      epochRequest.onsuccess = () => {
        epoch = Number(epochRequest.result ?? 0);
      };
      transaction.oncomplete = () => {
        db.close();
        resolve({ draft, epoch });
      };
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    }
  );
}

export async function writeLocalDraft(
  draft: LocalDraft,
  expectedEpoch: number
) {
  const db = await database();
  return new Promise<boolean>((resolve, reject) => {
    const transaction = db.transaction(['drafts', 'epochs'], 'readwrite');
    let written = false;
    const epoch = transaction.objectStore('epochs').get(draft.owner);
    epoch.onsuccess = () => {
      if (Number(epoch.result ?? 0) !== expectedEpoch) return;
      transaction.objectStore('drafts').put(draft);
      written = true;
    };
    transaction.oncomplete = () => {
      db.close();
      resolve(written);
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
    transaction.onabort = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export async function deleteLocalDraft(owner: string, path: string) {
  const db = await database();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction('drafts', 'readwrite');
    transaction.objectStore('drafts').delete(`${owner}:${path}`);
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export async function clearAccountDrafts(owner: string) {
  const db = await database();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(['drafts', 'epochs'], 'readwrite');
    const epochs = transaction.objectStore('epochs');
    const epoch = epochs.get(owner);
    epoch.onsuccess = () => {
      epochs.put(Number(epoch.result ?? 0) + 1, owner);
    };
    const cursor = transaction
      .objectStore('drafts')
      .index('owner')
      .openCursor(IDBKeyRange.only(owner));
    cursor.onsuccess = () => {
      const current = cursor.result;
      if (!current) return;
      current.delete();
      current.continue();
    };
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel('invia-drafts');
    channel.postMessage({ type: 'logout', owner });
    channel.close();
  }
  try {
    localStorage.setItem('invia-draft-logout', JSON.stringify({ owner, at: Date.now(), nonce: crypto.randomUUID() }));
  } catch { /* The IndexedDB epoch still fences writes without storage events. */ }
  window.dispatchEvent(
    new CustomEvent('invia-draft-logout', { detail: owner })
  );
}
