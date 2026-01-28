<script lang="ts">
	import { InputSymbol, getTransitionTable } from '$lib/automata/analisys/transitionTable';
	import { FSAGraph, Node, Transition } from '$lib/automata/models';

	const { fsaGraph }: { fsaGraph: FSAGraph } = $props();
	let graphElement = $state<HTMLElement | null>(null);
	$effect(() => {
		graphElement = document.getElementById('fsa-graph');
	});

	/**
	 * Groups consume input symbols, in order to display them in a single cell spanning multiple columns.
	 * This really only matters when handling PDAs, where multiple columns can share the same consume symbol but have different pop operations.
	 * @param inputs The list of input symbols to group.
	 * @returns The grouped comsume (only) input symbols with their respective span and list of transitions.
	 */
	function groupComputeInputs(
		inputs: InputSymbol[]
	): { symbol: string; span: number; transitions: Set<Transition> }[] {
		const groups: { symbol: string; span: number; transitions: Set<Transition> }[] = [];
		inputs.forEach((input) => {
			const lastGroup = groups.at(-1);
			if (lastGroup && lastGroup.symbol === input.consume) {
				lastGroup.span++;
				input.transitions.forEach((t) => lastGroup.transitions.add(t));
			} else {
				groups.push({
					symbol: input.consume,
					span: 1,
					transitions: new Set(input.transitions)
				});
			}
		});
		return groups;
	}

	/**
	 * Generates a map of nodes to unique labels, appending '#' to duplicate labels.
	 * @param nodes The list of nodes to generate labels for.
	 * @returns A map from each node to its unique label.
	 */
	function generateUniqueLabelsMap(nodes: Node[]): Map<Node, string> {
		const taken = new Set<string>();
		const nodeToLabel = new Map<Node, string>();
		nodes.forEach((node) => {
			let label = node.label;
			while (taken.has(label)) {
				label = `${label}#`;
			}
			taken.add(label);
			nodeToLabel.set(node, label);
		});
		return nodeToLabel;
	}

	/**
	 * Toggles the 'highlighted' class on an element in the graph by its data-id.
	 * @param id The data-id of the element to highlight.
	 * @param state Whether to add or remove the highlight.
	 */
	function toggleHighlight(id: string, state: boolean): void {
		const element = graphElement?.querySelector(`[data-id="${id}"]`);
		element?.classList.toggle('highlighted', state);
	}

	/**
	 * Batch toggles the 'highlighted' class on multiple elements in the graph by their data-ids.
	 * It is a simple wrapper around toggleHighlight, for convenience.
	 * @param ids The list of data-id of the elements to highlight.
	 * @param state Whether to add or remove the highlight.
	 */
	function batchToggleHighlight(ids: string[], state: boolean): void {
		ids.forEach((id) => toggleHighlight(id, state));
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
	{@const uniqueLabels = generateUniqueLabelsMap(fsaGraph.nodes)}
	{@const PdaMode = fsaGraph.hasStackOps}
	<table id="transition-table" class="table table-zebra">
		<thead id="table-header">
			{#if !PdaMode}
				<!-- Single row showing the consume input symbols -->
				<tr class="col-header">
					<td class="spacer invisible" colspan="2"></td>
					<th class="col-header-label v-borders h-borders">input</th>
					<td class="spacer v-borders h-borders"></td>
					{#each table.inputs as input}
						{@const transitionIds = Array.from(input.transitions).map((t) => t.id)}
						<th
							class="col-header-symbol v-borders h-borders"
							onmouseenter={() => batchToggleHighlight(transitionIds, true)}
							onmouseleave={() => batchToggleHighlight(transitionIds, false)}
						>
							{input.consume}
						</th>
					{/each}
				</tr>
			{:else}
				<!-- Two rows: first showing grouped consume input symbols, second showing pop symbols -->
				<tr class="col-header">
					<td class="spacer invisible" colspan="2"></td>
					<th class="col-header-label v-borders h-borders">input</th>
					<td class="spacer v-borders h-borders"></td>
					{#each groupComputeInputs(table.inputs) as group}
						{@const transitionIds = Array.from(group.transitions).map((t) => t.id)}
						<th
							colspan={group.span}
							class="col-header-symbol v-borders h-borders"
							onmouseenter={() => batchToggleHighlight(transitionIds, true)}
							onmouseleave={() => batchToggleHighlight(transitionIds, false)}
						>
							{group.symbol}
						</th>
					{/each}
				</tr>
				<tr class="col-header">
					<td class="spacer invisible" colspan="2"></td>
					<th class="col-header-label v-borders h-borders">stack</th>
					<td class="spacer v-borders h-borders"></td>
					{#each table.inputs as input}
						{@const transitionIds = Array.from(input.transitions).map((t) => t.id)}
						<th
							class="col-header-symbol v-borders h-borders"
							onmouseenter={() => batchToggleHighlight(transitionIds, true)}
							onmouseleave={() => batchToggleHighlight(transitionIds, false)}
						>
							{input.pop!}
						</th>
					{/each}
				</tr>
			{/if}
			<tr><td colspan={table.inputs.length + 2} class="spacer invisible"></td></tr>
		</thead>

		<tbody class="content">
			{#each table.content as row, rowIndex}
				{@const node = fsaGraph.nodes[rowIndex]}
				<tr>
					{#if rowIndex === 0}
						<th class="row-header-label v-borders h-borders" rowspan={table.content.length}>
							<span class="states-label">states</span>
						</th>
						<td class="spacer" rowspan={table.content.length}></td>
					{/if}
					<th
						class="row-header-state h-borders v-borders"
						data-node-id={node.id}
						onmouseenter={() => toggleHighlight(node.id, true)}
						onmouseleave={() => toggleHighlight(node.id, false)}
					>
						<!-- for the states, the label also indicates if it is starting and/or accepting -->
						{#if node.id === fsaGraph.startNode?.id}
							→
						{/if}
						{#if node.isAccepting}
							[{uniqueLabels.get(node)}]
						{:else}
							{uniqueLabels.get(node)}
						{/if}
					</th>
					<td class="spacer h-borders v-borders"></td>
					{#each row as cell}
						<td class="cell h-borders v-borders">
							{#if cell.length === 0}
								<!-- Empty cell -->
								&mdash;
							{:else}
								<ul class="transition-output-list">
									{#each cell as output}
										{@const stateLabel = uniqueLabels.get(output.targetState)!}
										<li
											class="transition-output-entry whitespace-nowrap"
											role="presentation"
											data-transition-id={output.transition.id}
											onmouseenter={() => toggleHighlight(output.transition.id, true)}
											onmouseleave={() => toggleHighlight(output.transition.id, false)}
										>
											{#if PdaMode}
												{`(${output.transition.push}, ${stateLabel})`}
											{:else}
												{`${stateLabel}`}
											{/if}
										</li>
									{/each}
								</ul>
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
