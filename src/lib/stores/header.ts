import { writable } from 'svelte/store';
import type { Snippet } from 'svelte';

export const headerActions = writable<Snippet | null>(null);
