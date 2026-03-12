<script lang="ts">
	import { FSAGraph, Node } from '$lib/automata-models';
	import {
		CommandHistory,
		UpdateNodeLabelCommand,
		ToggleNodeAcceptingCommand,
		SetStartNodeCommand
	} from '../commands';

	const {
		node,
		fsaGraph,
		commandHistory
	}: { node: Node; fsaGraph: FSAGraph; commandHistory: CommandHistory } = $props();
	// svelte-ignore state_referenced_locally
	// (we only care about the initial value, svelte complains that this is not reactive)
	let labelBeforeEdit = node.label;

	function updateLabel(_e: Event) {
		const newLabel = node.label;
		if (labelBeforeEdit === newLabel) return;
		const command = new UpdateNodeLabelCommand(node.id, labelBeforeEdit, newLabel);
		commandHistory.push(command);
		labelBeforeEdit = newLabel;
	}

	function toggleAccepting() {
		const command = new ToggleNodeAcceptingCommand(node.id, !node.isAccepting);
		commandHistory.pushAndExecute(command);
	}

	function toggleStarting() {
		const newStartNode = fsaGraph.startNode?.id === node.id ? null : node.id;
		const command = new SetStartNodeCommand(newStartNode);
		commandHistory.pushAndExecute(command);
	}
</script>

<div class="flex w-full flex-col gap-4">
	<label for="label" class="flex items-center justify-between gap-2">
		Label
		<input
			id="label"
			type="text"
			class="input-bordered input max-w-1/2 text-right"
			bind:value={node.label}
			onblur={updateLabel}
		/>
	</label>
	<label for="isAccepting" class="flex items-center justify-between gap-2">
		Is Accepting
		<input
			id="isAccepting"
			type="checkbox"
			class="checkbox checkbox-sm checkbox-success"
			checked={node.isAccepting}
			onchange={toggleAccepting}
		/>
	</label>
	<label for="isStarting" class="flex items-center justify-between gap-2">
		Is Starting
		<input
			id="isStarting"
			type="checkbox"
			class="checkbox checkbox-sm checkbox-success"
			checked={fsaGraph.startNode?.id === node.id}
			onchange={toggleStarting}
		/>
	</label>
</div>
