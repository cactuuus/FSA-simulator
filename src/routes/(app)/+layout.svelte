<script lang="ts">
	import '../../app.css';
	import { onMount } from 'svelte';
	import { app } from '$lib/stores/app.svelte';
	import { default as Toasts } from '$lib/utils/Toasts.svelte';
	import { notifyWarning } from '$lib/utils/notifications';
	import { storage } from '$lib/utils/storage';
	import { portal } from '$lib/utils/portal';

	let { children } = $props();
	const SMALL_SCREEN_THRESHOLD = 800; // pixels (below are phones and small tablets)
	const AUTOSAVE_TIMER = 10000; // milliseconds
	const SMALL_SCREEN_DISMISSED_KEY = 'small-screen-warning-dismissed';

	let mounted = $state(false);
	let smallScreenModal: HTMLDialogElement;
	let dontShowSmallScreenAgain = $state(false);

	/**
	 * Initializes the session by attempting to load the previous session from storage.
	 */
	function initializeSession(): void {
		if (app.canUseSessionStorage()) {
			try {
				app.loadSession();
			} catch (e) {
				notifyWarning('Failed to load session data from storage. Starting a new session.');
				app.resetSession();
				console.error('Session load error:', e);
			}
		} else {
			notifyWarning('Session storage is not available. Session data will not be saved.');
		}
	}

	/**
	 * Sets up autosaving of the session at regular intervals and before the window unloads.
	 * @return A cleanup function to remove the interval and event listener.
	 */
	function setupAutoSave(timer: number): () => void {
		if (!app.canUseSessionStorage()) return () => {}; // Do nothing
		const autoSaveInterval = setInterval(() => {
			app.saveSession();
		}, timer);
		function saveBeforeClosing() {
			app.saveSession();
		}
		window.addEventListener('beforeunload', saveBeforeClosing);
		return () => {
			clearInterval(autoSaveInterval);
			window.removeEventListener('beforeunload', saveBeforeClosing);
		};
	}

	function closeSmallScreenModal() {
		if (dontShowSmallScreenAgain) {
			storage.save(SMALL_SCREEN_DISMISSED_KEY, true);
		}
		smallScreenModal.close();
	}

	onMount(() => {
		initializeSession();
		const cleanupAutoSave = setupAutoSave(AUTOSAVE_TIMER);
		mounted = true;

		// show small screen warning if not dismissed and screen is below threshold
		const dismissed = storage.load<boolean>(SMALL_SCREEN_DISMISSED_KEY) || false;
		if (!dismissed && window.innerWidth < SMALL_SCREEN_THRESHOLD) {
			smallScreenModal.showModal();
		}

		return cleanupAutoSave;
	});
</script>

<!-- Overlay to indicate the app is not mounted yet -->
{#if !mounted}
	<div
		class="absolute z-1000 flex h-dvh w-full flex-col items-center justify-center gap-4 bg-base-300/80"
	>
		Loading...
		<span class="loading loading-xl loading-spinner"></span>
	</div>
{/if}

<main class="relative h-dvh w-full">
	{@render children?.()}
</main>

<!-- Small screen warning modal -->
<dialog bind:this={smallScreenModal} class="modal" use:portal>
	<div class="modal-box">
		<h3 class="text-lg font-bold text-warning">Small screen detected</h3>
		<p class="pt-3 text-sm text-base-content/80">
			Hey small screen user!
			<br />
			This app was designed for larger screens. You can still use it of course, but bear in mind that
			some features may not display or work as intended.
		</p>
		<div class="modal-action flex items-center justify-between gap-2">
			<label class="flex cursor-pointer items-center gap-2 text-sm text-base-content/60">
				<input
					type="checkbox"
					class="checkbox checkbox-sm checkbox-primary"
					bind:checked={dontShowSmallScreenAgain}
				/>
				Don't show this again
			</label>
			<button class="btn btn-sm btn-primary" onclick={closeSmallScreenModal}> Got it </button>
		</div>
	</div>
</dialog>
<Toasts />
