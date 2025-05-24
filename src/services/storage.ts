/**
 * Storage service for managing browser storage (localStorage, sessionStorage)
 * Provides a consistent API with error handling and JSON serialization
 */

export interface StorageOptions {
  expires?: number // Expiration time in milliseconds
  secure?: boolean // Whether to encrypt the data (future enhancement)
}

class StorageService {
  private prefix = 'sim_'

  /**
   * Get the full key with prefix
   */
  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  /**
   * Set item in localStorage
   */
  set<T>(key: string, value: T, options?: StorageOptions): void {
    try {
      const data = {
        value,
        timestamp: Date.now(),
        expires: options?.expires ? Date.now() + options.expires : null,
      }
      localStorage.setItem(this.getKey(key), JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }

  /**
   * Get item from localStorage
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.getKey(key))
      if (!item) return null

      const data = JSON.parse(item)

      // Check if expired
      if (data.expires && Date.now() > data.expires) {
        this.remove(key)
        return null
      }

      return data.value as T
    } catch (error) {
      console.error('Failed to get from localStorage:', error)
      return null
    }
  }

  /**
   * Remove item from localStorage
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(this.getKey(key))
    } catch (error) {
      console.error('Failed to remove from localStorage:', error)
    }
  }

  /**
   * Clear all items with the app prefix
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
    }
  }

  /**
   * Set item in sessionStorage
   */
  setSession<T>(key: string, value: T): void {
    try {
      sessionStorage.setItem(this.getKey(key), JSON.stringify(value))
    } catch (error) {
      console.error('Failed to save to sessionStorage:', error)
    }
  }

  /**
   * Get item from sessionStorage
   */
  getSession<T>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(this.getKey(key))
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('Failed to get from sessionStorage:', error)
      return null
    }
  }

  /**
   * Remove item from sessionStorage
   */
  removeSession(key: string): void {
    try {
      sessionStorage.removeItem(this.getKey(key))
    } catch (error) {
      console.error('Failed to remove from sessionStorage:', error)
    }
  }

  /**
   * Get storage size in bytes
   */
  getSize(): number {
    let size = 0
    for (const key in localStorage) {
      if (key.startsWith(this.prefix)) {
        size += localStorage[key].length + key.length
      }
    }
    return size
  }
}

export const storage = new StorageService()
