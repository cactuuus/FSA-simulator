<script lang="ts">
	import { Edge } from '$lib/fsa';

	const { edge }: { edge: Edge } = $props();
	const canDeleteTransition = $derived(edge.transitionSymbols.length > 1);
</script>

<div class="flex flex-col gap-6">
	<div>
		<p>Transition symbols</p>

		{#each edge.transitionSymbols as symbol, index}
			<fieldset class="fieldset flex items-center gap-1 rounded-box bg-base-300 p-2">
				<legend class="fieldset-legend w-full">
					<span class="badge badge-soft badge-sm badge-neutral">{symbol.toString()}</span>
					<button
						class="btn float-right btn-xs btn-error"
						onclick={() => edge.removeTransition(index)}
						title="Remove this transition symbol"
						disabled={!canDeleteTransition}
					>
						Remove
					</button>
				</legend>
				<label for="consume-{index}" class="flex-1">
					Consume
					<input
						id="consume-{index}"
						type="text"
						class="input-bordered input mt-1 w-full"
						bind:value={symbol.consume}
					/>
				</label>
				<label for="pop-{index}" class="flex-1">
					Pop
					<input
						id="pop-{index}"
						type="text"
						class="input-bordered input mt-1 w-full"
						bind:value={symbol.pop}
						placeholder="null"
					/>
				</label>
				<label for="push-{index}" class="flex-1">
					Push
					<input
						id="push-{index}"
						type="text"
						class="input-bordered input mt-1 w-full"
						bind:value={symbol.push}
						placeholder="null"
					/>
				</label>
			</fieldset>
		{/each}
	</div>
	<button class="btn btn-outline btn-success" onclick={() => edge.addTransition()}>
		Add Symbols
	</button>
	<hr class="border-base-content/70" />
	<div class="flex items-center justify-end gap-2">
		<span class="flex-1">Connects</span>
		<span class="badge font-bold badge-info">{edge.from.label}</span>
		⟶
		<span class="badge font-bold badge-info">{edge.to.label}</span>
	</div>
</div>
