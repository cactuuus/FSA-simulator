<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { headerActions } from '$lib/stores/header';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="navbar bg-base-100 shadow-sm">
	<h1 id="banner" class="text-2xl font-extrabold">FSA Simulator</h1>
	<div id="page-actions" class="grow px-4">
		{#if $headerActions}
			{@render $headerActions()}
		{/if}
	</div>
</header>

<main class="h-10/12 min-h-[800px] py-4">
	{@render children?.()}
</main>
