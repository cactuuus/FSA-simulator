<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Actions, Toast } from '$lib/ui';
	import { onMount } from 'svelte';

	let { children } = $props();

	let mounted = $state(false);
	onMount(() => {
		mounted = true;
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
	<h1 id="banner" class="text-xl font-extrabold">FSA Simulator</h1>
	<div id="page-actions" class="flex grow items-end">
		<Actions />
	</div>
</header>

<main class="relative h-[calc(100vh-3rem)] w-full">
	{@render children?.()}
</main>
<Toast />
