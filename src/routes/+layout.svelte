<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Actions, Toast, TitleEditor } from '$lib/ui';
	import { onMount, untrack } from 'svelte';
	import { app } from '$lib/stores/app.svelte';

	let { children } = $props();
	const DEBOUCE_DELAY = 10000; // milliseconds

	let mounted = $state(false);
	onMount(() => {
		app.loadSession();
		mounted = true;

		// auto-save working graph changes
		$effect(() => {
			// simple way to trigger reactivity on graph and viewport changes
			app.fsaGraph.toJSON();
			app.viewport.toJSON();
			const timeout = setTimeout(() => {
				untrack(() => app.saveSession());
			}, DEBOUCE_DELAY);
			return () => clearTimeout(timeout);
		});

		// auto-save viewport changes
		$effect(() => {
			const timeout = setTimeout(() => {
				untrack(() => app.saveSession());
			}, DEBOUCE_DELAY);
			return () => clearTimeout(timeout);
		});

		// save before navigating away (close, refresh, etc)
		function handleBeforeUnload() {
			app.saveSession();
		}
		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- Overlay to indicate the app is not mounted yet -->
{#if !mounted}
	<div
		class="absolute z-100 flex h-full w-full flex-col items-center justify-center gap-4 bg-base-200/70"
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

<main class="relative h-[calc(100vh-3rem)] w-full">
	{@render children?.()}
</main>
<Toast />
