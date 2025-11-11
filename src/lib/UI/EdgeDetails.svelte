<script lang="ts">
	import { Edge } from '$lib/fsa';

	const { edge }: { edge: Edge } = $props();
</script>

<div class="flex flex-col gap-6">
	<label for="label">
		Label
		<input
			id="label"
			type="text"
			class="input-bordered input mt-1 w-full"
			bind:value={edge.label}
		/>
	</label>
	<hr class="border-base-content/70" />
	<div class="mt-1 flex items-center justify-end gap-2">
		<span class="flex-1">Connects</span>
		<span class="badge font-bold badge-info">{edge.from.label}</span>
		⟶
		<span class="badge font-bold badge-info">{edge.to.label}</span>
	</div>
</div>
