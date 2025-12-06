<script lang="ts">
	import { Node, type FSAGraph } from '$lib/automata/models';

	const { node, fsa }: { node: Node; fsa: FSAGraph } = $props();
</script>

<div class="flex flex-col gap-4">
	<label for="label" class="flex items-center justify-between gap-2">
		Label
		<input
			id="label"
			type="text"
			class="input-bordered input max-w-1/2 text-right"
			bind:value={node.label}
		/>
	</label>
	<label for="isAccepting" class="flex items-center justify-between gap-2">
		Is Accepting
		<input
			id="isAccepting"
			type="checkbox"
			class="checkbox checkbox-success"
			bind:checked={node.isAccepting}
		/>
	</label>
	<label for="isStarting" class="flex items-center justify-between gap-2">
		Is Starting
		<input
			id="isStarting"
			type="checkbox"
			class="checkbox checkbox-success"
			checked={fsa.startNode?.id === node.id}
			onchange={(event) => {
				const checked = event.currentTarget.checked;
				fsa.startNode = checked ? node : null;
			}}
		/>
	</label>
</div>
