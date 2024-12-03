const DB_NAME = 'thamizhi'
const DB_VERSION = 1
const USER_STORE = 'mastodonUser'

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(USER_STORE)) {
        db.createObjectStore(USER_STORE)
      }
    }
  })
}

export const setMastodonUser = async (userData: any) => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(USER_STORE, 'readwrite')
    const store = transaction.objectStore(USER_STORE)
    const request = store.put(userData, 'currentUser')

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

export const getMastodonUser = async () => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(USER_STORE, 'readonly')
    const store = transaction.objectStore(USER_STORE)
    const request = store.get('currentUser')

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

export const removeMastodonUser = async () => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(USER_STORE, 'readwrite')
    const store = transaction.objectStore(USER_STORE)
    const request = store.delete('currentUser')

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}
