<script lang="ts">
	import { WINDOWS_ID } from '$lib/interaction/Windows.svelte';
	import { app } from '$lib/stores/app.svelte';
	import FloatingWindow from '$lib/ui/components/FloatingWindow.svelte';
	import SelectedItemPanel from './SelectionPanel.svelte';
</script>

<FloatingWindow
	id={WINDOWS_ID.Selection}
	windowState={app.windows.open(WINDOWS_ID.Selection)!}
	initialPosition={{ x: 0, y: 0 }}
	canBeResized={false}
>
	{#snippet header()}
		<span>Selection Panel</span>
	{/snippet}
	{#snippet content()}
		<SelectedItemPanel selection={app.editor.selection} fsaGraph={app.editor.fsaGraph} />
	{/snippet}
</FloatingWindow>
