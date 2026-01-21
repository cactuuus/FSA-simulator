<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { app } from '$lib/stores/app.svelte';
	import { Actions, Toasts, TitleEditor } from '$lib/ui';
	import { notifyWarning } from '$lib/utils/notifications';

	let { children } = $props();
	const AUTOSAVE_TIMER = 10000; // milliseconds
	let mounted = $state(false);

	onMount(() => {
		const hasStorage = app.canUseSessionStorage();
		if (hasStorage) {
			app.loadSession();
		} else {
			notifyWarning('Session storage is not available. Session data will not be saved.');
		}
		mounted = true;

		if (hasStorage) {
			const autoSaveInterval = setInterval(() => {
				app.saveSession();
			}, AUTOSAVE_TIMER);
			function saveBeforeClosing() {
				app.saveSession();
			}
			window.addEventListener('beforeunload', saveBeforeClosing);
			return () => {
				clearInterval(autoSaveInterval);
				window.removeEventListener('beforeunload', saveBeforeClosing);
			};
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- Overlay to indicate the app is not mounted yet -->
{#if !mounted}
	<div
		class="absolute z-100 flex h-dvh w-full flex-col items-center justify-center gap-4 bg-base-200/70"
	>
		Loading...
		<span class="loading loading-xl loading-spinner"></span>
	</div>
{/if}

<header class="navbar flex min-h-12! items-end gap-6 bg-base-100">
	<div id="banner" class="text-lg font-extrabold">
		<TitleEditor fsaGraph={app.fsaGraph} />
	</div>
	<div id="page-actions" class="flex grow items-end">
		<Actions />
	</div>
</header>

<main class="relative h-[calc(100dvh-3rem)] w-full">
	{@render children?.()}
</main>
<Toasts />
