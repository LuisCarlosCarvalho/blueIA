export interface ImportStudioProjectData {
  id: string
  userId: string
  originalSource: any
  sourceType: 'elementor' | 'html-css'
  schemaVersion: number
  compatibilityReport: any[]
  projectData: any // GrapesJS project data (HTML/CSS or components)
  createdAt: number
  updatedAt: number
}

const DB_NAME = 'bluebolt-import-studio'
const DB_VERSION = 1
const STORE_NAME = 'projects'
const MAX_JSON_SIZE_MB = 10

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(new Error('IndexedDB indisponível ou bloqueado. Verifique as definições de privacidade.'))
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('userId', 'userId', { unique: false })
        store.createIndex('updatedAt', 'updatedAt', { unique: false })
      }
    }
  })
}

function calculateSize(obj: any): number {
  try {
    const str = JSON.stringify(obj)
    return new Blob([str]).size / (1024 * 1024)
  } catch {
    return 0
  }
}

export class ImportStudioRepository {
  static async saveProject(data: ImportStudioProjectData): Promise<void> {
    const size = calculateSize(data)
    if (size > MAX_JSON_SIZE_MB) {
      throw new Error(`Quota excedida: O projeto tem ${size.toFixed(2)}MB, ultrapassando o limite de ${MAX_JSON_SIZE_MB}MB.`)
    }

    const db = await getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      
      const request = store.put(data)

      request.onsuccess = () => resolve()
      request.onerror = (e) => {
        const error = (e.target as IDBRequest).error
        if (error?.name === 'QuotaExceededError') {
          reject(new Error('Quota excedida: Não há espaço disponível no disco para guardar o projeto.'))
        } else {
          reject(new Error('Falha inesperada ao guardar na base de dados local.'))
        }
      }
    })
  }

  static async loadProject(id: string): Promise<ImportStudioProjectData | null> {
    const db = await getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(new Error('Falha ao carregar o projeto.'))
    })
  }

  static async deleteProject(id: string): Promise<void> {
    const db = await getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('Falha ao apagar o projeto.'))
    })
  }
}
