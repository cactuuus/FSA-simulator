<script lang="ts">
	import { Undo, Redo } from '@lucide/svelte';
	import { notifyError, notifyInfo } from '$lib/utils/notifications';
	import { type CommandHistory } from './CommandHistory.svelte';
	import { isTyping } from '$lib/utils/keyboard';
	import { onMount } from 'svelte';

	const { commandHistory }: { commandHistory: CommandHistory } = $props();

	function undoCommand() {
		const command = commandHistory.peekUndo();
		try {
			if (!commandHistory.canUndo) return;
			commandHistory.undo();
			notifyInfo(`Undone '${command}' command.`);
		} catch (error) {
			notifyError(`Failed to undo command '${command}'`);
			console.error('Error during undo:', error);
		}
	}

	function redoCommand() {
		const command = commandHistory.peekRedo();
		try {
			if (!commandHistory.canRedo) return;
			commandHistory.redo();
			notifyInfo(`Redone '${command}' command.`);
		} catch (error) {
			notifyError(`Failed to redo command '${command}'`);
			console.error('Error during redo:', error);
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (isTyping(e)) return;
		if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
			e.preventDefault();
			undoCommand();
		} else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
			e.preventDefault();
			redoCommand();
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

<div class="flex h-10 items-center gap-0.5 rounded-box bg-base-100/95 px-3 py-2 text-sm shadow">
	<button
		class="btn btn-square btn-ghost btn-xs"
		onclick={undoCommand}
		aria-label="Undo"
		title="Undo (Ctrl+Z)"
		disabled={!commandHistory.canUndo}
	>
		<Undo class="h-4 w-4" />
	</button>
	<button
		class="btn btn-square btn-ghost btn-xs"
		onclick={redoCommand}
		aria-label="Redo"
		title="Redo (Ctrl+Y)"
		disabled={!commandHistory.canRedo}
	>
		<Redo class="h-4 w-4" />
	</button>
</div>
