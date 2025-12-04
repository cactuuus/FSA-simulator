<script lang="ts">
	import { Edge } from '$lib/automata/models';

	const { edge }: { edge: Edge } = $props();
	const canDeleteTransition = $derived(edge.transitionSymbols.length > 1);
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-col gap-2">
		<h2 class="font-semibold">Symbols</h2>
		<div class="flex max-h-120 flex-col gap-2 overflow-y-auto">
			{#each edge.transitionSymbols as symbol, index}
				<fieldset class="fieldset flex items-center gap-2 rounded-box bg-base-300 p-2">
					<legend class="fieldset-legend w-full py-0">
						<span class="badge border-0 bg-base-300 badge-sm">
							[{index + 1}] {symbol.toString()}
						</span>
						<button
							class="btn float-right btn-xs btn-error"
							onclick={() => edge.removeTransition(index)}
							title="Remove this transition symbol"
							disabled={!canDeleteTransition}
						>
							Remove
						</button>
					</legend>
					<label for="consume-{index}" class="mr-3 flex-1">
						Consume
						<input
							id="consume-{index}"
							type="text"
							class="input-bordered input mt-1 w-full"
							bind:value={symbol.consume}
						/>
					</label>
					<label for="pop-{index}" class="flex-1">
						Pop (PDA)
						<input
							id="pop-{index}"
							type="text"
							class="input-bordered input mt-1 w-full"
							bind:value={symbol.pop}
							placeholder="null"
						/>
					</label>
					<label for="push-{index}" class="flex-1">
						Push (PDA)
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
	</div>
	<button class="btn btn-success" onclick={() => edge.addTransition()}> Add Symbols </button>
	<hr class="border-base-content/70" />
	<div class="flex items-center justify-end gap-2">
		<span class="flex-1">Connects</span>
		<span class="badge font-bold badge-info">{edge.from.label}</span>
		⟶
		<span class="badge font-bold badge-info">{edge.to.label}</span>
	</div>
</div>
