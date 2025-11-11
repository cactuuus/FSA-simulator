<script lang="ts">
	import { Node } from '$lib/fsa';

	const { node }: { node: Node } = $props();
</script>

<div class="flex flex-col gap-6">
	<label for="label">
		Label
		<input
			id="label"
			type="text"
			class="input-bordered input mt-1 w-full"
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
			bind:checked={node.isStart}
		/>
	</label>
</div>
