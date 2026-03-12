<script lang="ts">
	import { Menu } from '@lucide/svelte';
	import FileSubMenu from './FileSubMenu.svelte';
	import WindowsSubMenu from './WindowsSubMenu.svelte';

	const { simulationActive }: { simulationActive: boolean } = $props();
</script>

<div class="dropdown dropdown-start">
	<div
		class="flex h-10 items-center gap-0.5 rounded-box bg-base-100/90 shadow backdrop-blur-xs"
		class:cursor-not-allowed={simulationActive}
		title={simulationActive ? 'Menu is disabled during simulation' : 'Menu'}
	>
		<button
			class="btn btn-square h-10 rounded-box btn-ghost"
			aria-label="Menu"
			disabled={simulationActive}
		>
			<Menu class="h-5 w-5" />
		</button>
	</div>
	<ul
		class="dropdown-content menu z-20 mt-1 w-56 rounded-box border border-base-content/10 bg-base-200 p-2 shadow"
	>
		<li><FileSubMenu /></li>
		<li><WindowsSubMenu /></li>
	</ul>
</div>
