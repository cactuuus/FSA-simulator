import { browser } from '$app/environment';

/**
 * Utility functions for saving, loading, and removing data from localStorage with simple error handling.
 */
export const storage = {
	save(key: string, data: unknown): void {
		if (!browser) return;
		try {
			localStorage.setItem(key, JSON.stringify(data));
		} catch (error: unknown) {
			console.error(`Failed to write to localStorage for key "${key}":`, error);
		}
	},

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

	remove(key: string): void {
		if (!browser) return;
		try {
			localStorage.removeItem(key);
		} catch (error: unknown) {
			console.error(`Failed to remove localStorage item for key "${key}":`, error);
		}
	}
};
