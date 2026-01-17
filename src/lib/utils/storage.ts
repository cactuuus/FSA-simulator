import { browser } from '$app/environment';

/**
 * Utility functions for saving, loading, and removing data from localStorage with simple error handling.
 */
export const storage = {
	_isAvailable: null as boolean | null,

	/**
	 * Checks if localStorage is available in the current environment.
	 * It chaches the result after the first check, to avoid repeated checks.
	 * @returns True if localStorage is available, false otherwise.
	 */
	isAvailable: function (): boolean {
		if (!browser) return false;
		if (this._isAvailable === null) {
			try {
				const testKey = 'local-storage-test-key';
				localStorage.setItem(testKey, 'local-storage-test-');
				localStorage.removeItem(testKey);
				this._isAvailable = true;
			} catch (error: unknown) {
				this._isAvailable = false;
				console.warn('localStorage is not available:', error);
			}
		}
		return this._isAvailable;
	},

	/**
	 * Saves data to localStorage under the specified key.
	 * @param key Key under which to store the data.
	 * @param data Data to be stored.
	 */
	save(key: string, data: unknown): void {
		if (!browser) return;
		try {
			localStorage.setItem(key, JSON.stringify(data));
		} catch (error: unknown) {
			console.error(`Failed to write to localStorage for key "${key}":`, error);
		}
	},

	/**
	 * Loads data from localStorage for the specified key. It takes a generic type parameter T to specify the expected return type.
	 * If an error occurs during parsing, the data is considered corrupted and an attempt is made to remove it.
	 * @param key Key under which the data is stored.
	 * @returns The loaded data, or null if not found or on error.
	 */
	load<T>(key: string): T | null {
		if (!browser) return null;
		try {
			const item = localStorage.getItem(key);
			return item ? (JSON.parse(item) as T) : null;
		} catch (error: unknown) {
			console.error(
				`Failed to load localStorage item for key "${key}". Attempting to remove corrupted item.`,
				error
			);
			localStorage.removeItem(key);
			return null;
		}
	},

	/**
	 * Removes an item from localStorage for the specified key.
	 * @param key Key under which the data is stored.
	 */
	remove(key: string): void {
		if (!browser) return;
		try {
			localStorage.removeItem(key);
		} catch (error: unknown) {
			console.error(`Failed to remove localStorage item for key "${key}":`, error);
		}
	}
};
