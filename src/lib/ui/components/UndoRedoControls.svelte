<script lang="ts">
	import { Undo, Redo } from '@lucide/svelte';

	const {
		onRedo,
		onUndo,
		canRedo,
		canUndo
	}: { onRedo: () => void; onUndo: () => void; canRedo: boolean; canUndo: boolean } = $props();
</script>

<button
	class="btn btn-square btn-ghost btn-sm"
	onclick={onUndo}
	aria-label="Undo"
	title="Undo"
	disabled={!canUndo}
>
	<Undo class="h-4 w-4" />
</button>
<button
	class="btn btn-square btn-ghost btn-sm"
	onclick={onRedo}
	aria-label="Redo"
	title="Redo"
	disabled={!canRedo}
>
	<Redo class="h-4 w-4" />
</button>
