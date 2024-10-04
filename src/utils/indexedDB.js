let db;

const dbName = 'PostsDatabase';
const storeName = 'posts';
const version = 1;

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(dbName, version);

    request.onerror = (event) => reject("IndexedDB error: " + event.target.error);

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      const objectStore = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
      objectStore.createIndex('title', 'title', { unique: false });
      objectStore.createIndex('filename', 'filename', { unique: false });
      objectStore.createIndex('filetype', 'filetype', { unique: false });
      objectStore.createIndex('url', 'url', { unique: false });
      objectStore.createIndex('post', 'post', { unique: false });
      objectStore.createIndex('collection', 'collection', { unique: false });
      objectStore.createIndex('cluster', 'cluster', { unique: false });
      objectStore.createIndex('tags', 'tags', { unique: false });
      objectStore.createIndex('notes', 'notes', { unique: false });
    };
  });
};

export const createPost = async (postData) => {
  await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.add(postData);

    request.onerror = (event) => reject("Error creating post: " + event.target.error);
    request.onsuccess = (event) => resolve(event.target.result);
  });
};

export const updatePost = async (id, postData) => {
  await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.put({ ...postData, id });

    request.onerror = (event) => reject("Error updating post: " + event.target.error);
    request.onsuccess = () => resolve();
  });
};

export const getPost = async (id) => {
  await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.get(id);

    request.onerror = (event) => reject("Error getting post: " + event.target.error);
    request.onsuccess = (event) => resolve(event.target.result);
  });
};

export const getAllPosts = async () => {
  await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.getAll();

    request.onerror = (event) => reject("Error getting all posts: " + event.target.error);
    request.onsuccess = (event) => resolve(event.target.result);
  });
};