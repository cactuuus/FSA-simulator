<script lang="ts">
	import { WINDOWS_ID } from '$lib/interaction/Windows.svelte';
	import FloatingWindow from '$lib/ui/components/FloatingWindow.svelte';
	import SelectedItemPanel from './SelectionPanel.svelte';
	import { Window } from '$lib/interaction';
	import { type EditorContext } from '$lib/interaction/editor';

	const { editor, window }: { editor: EditorContext; window: Window } = $props();
</script>

<FloatingWindow
	id={WINDOWS_ID.Selection}
	windowState={window}
	initialPosition={{ x: 0, y: 0 }}
	canBeResized={false}
>
	{#snippet header()}
		<span>Selection Panel</span>
	{/snippet}
	{#snippet content()}
		<SelectedItemPanel {editor} />
	{/snippet}
</FloatingWindow>
