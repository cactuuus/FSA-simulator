<script lang="ts">
	import { InputSymbol, getTransitionTable } from '$lib/automata/analisys/transitionTable';
	import { FSAGraph } from '$lib/automata/models';

	const { fsaGraph }: { fsaGraph: FSAGraph } = $props();

	/**
	 * Groups consume input symbols, in order to display them in a single cell spanning multiple columns.
	 * This really only matters when handling PDAs, where multiple columns can share the same consume symbol but have different pop operations.
	 * @param inputs The list of input symbols to group.
	 * @returns The grouped comsume (only) input symbols with their respective span.
	 */
	function groupComputeInputs(inputs: InputSymbol[]): { symbol: string; span: number }[] {
		const groups: { symbol: string; span: number }[] = [];
		inputs.forEach((input) => {
			const lastGroup = groups.at(-1);
			if (lastGroup && lastGroup.symbol === input.consume) {
				lastGroup.span++;
			} else {
				groups.push({ symbol: input.consume, span: 1 });
			}
		});
		return groups;
	}
</script>

{#if fsaGraph.edges.length === 0}
	<p class="mt-4 rounded-box bg-base-300 p-4 text-center text-base-content/70">
		Nothing to show!
		<br />
		The FSA has no transitions.
	</p>
{:else}
	{@const table = getTransitionTable(fsaGraph)}
	<table id="transition-table" class="table w-full table-zebra text-center">
		<thead id="header-row">
			{#if !fsaGraph.hasStackOps}
				<!-- Single row showing the consume input symbols -->
				<tr id="header-row-consume">
					<th colspan="1" class="header-col"></th>
					{#each table.inputs as input}
						<th>
							{input.consume}
						</th>
					{/each}
				</tr>
			{:else}
				<!-- Two rows: first showing grouped consume input symbols, second showing pop symbols -->
				<tr id="header-row-consume">
					<th rowspan="2" class="header-col"></th>
					{#each groupComputeInputs(table.inputs) as group}
						<th colspan={group.span}>
							{group.symbol}
						</th>
					{/each}
				</tr>
				<tr id="sub-header-row-pop">
					{#each table.inputs as input}
						<th>
							{input.pop!}
						</th>
					{/each}
				</tr>
			{/if}
		</thead>

		<tbody id="body-rows">
			{#each table.content as row, rowIndex}
				<tr>
					<th class="header-col">
						{table.states[rowIndex]}
					</th>
					{#each row as cell}
						<td>
							{#if cell.length === 0}
								<!-- Empty cell -->
								&mdash;
							{:else}
								{#each cell as transitionTarget}
									<div>{transitionTarget}</div>
								{/each}
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
