<script lang="ts">
	import { MANUAL_SECTIONS } from '$lib/utils/manual';
	import { CirclePlus, Spline, Hand, MousePointer } from '@lucide/svelte';

	const SHORTCUTS = [
		['Pan tool', ['1']],
		['Select tool', ['2']],
		['Draw Edge tool', ['3']],
		['Add State tool', ['4']],
		['De-select all', ['Escape']],
		['Delete selected', ['Delete']],
		['Undo', ['Ctrl', 'Z']],
		['Redo', ['Ctrl', 'Y']],
		['Zoom in/out', ['Ctrl', 'Scroll']],
		['Pan vertically', ['Scroll']],
		['Pan horizontally', ['Shift', 'Scroll']],
		['Snap to symmetric curve (when adjusting an edge curve)', ['Shift']]
	];
</script>

<section id={MANUAL_SECTIONS.INTERFACE.id} data-section class="section-header">
	<h2>{MANUAL_SECTIONS.INTERFACE.title}</h2>
</section>

<!-- Overview -->
<section id={MANUAL_SECTIONS.INTERFACE_OVERVIEW.id} data-section class="subsection">
	<h3>{MANUAL_SECTIONS.INTERFACE_OVERVIEW.title}</h3>
	<img
		src="/manual/interface-overview.avif"
		alt="Screenshot of the editor interface with key features highlighted"
		loading="lazy"
	/>
	<p class="text-normal bottom-spaced">
		The main interface consists of a screen-wide <strong>canvas</strong> used to draw and interact with
		the FSA.
	</p>
</section>

<!-- Toolbar -->
<section id={MANUAL_SECTIONS.INTERFACE_TOOLBAR.id} data-section class="subsection">
	<h3>{MANUAL_SECTIONS.INTERFACE_TOOLBAR.title}</h3>
	<p class="text-normal">
		This panel contains all the available tools for working on the automaton. Each allows to perform
		a specific set of actions, and you can switch between them by simply clicking on them or by
		using their respective keyboard shortcuts.
	</p>
	<ul class="panel-list">
		<li>
			<div class="item-header">
				<span class="toolbar-item">
					<Hand class="h-4 w-4" /> Pan
				</span>
				<span class="text-subtle">— keyboard shortcut:</span>
				<kbd>1</kbd>
			</div>
			<p class="text-normal">
				Click and drag to pan the canvas. Panning is also available in any tool via
				<kbd>Scroll</kbd> (vertical) and <kbd>Shift</kbd>+<kbd>Scroll</kbd> (horizontal).
			</p>
		</li>
		<li>
			<div class="item-header">
				<span class="toolbar-item">
					<MousePointer class="h-4 w-4" /> Select
				</span>
				<span class="text-subtle">— keyboard shortcut:</span>
				<kbd>2</kbd>
			</div>
			<p class="text-normal">
				The main editing tool. It allows to edit existing states and edges (through a contextual
				panel appearing when an item is selected). Additionally, you can:
			</p>
			<ul class="simple-list">
				<li>Drag a state to reposition it on the canvas.</li>
				<li>
					Drag an edge to adjust its curvature. Holding <kbd>Shift</kbd> while dragging snaps the
					curve to the midpoint between the two connected states, resulting in a <em>symmetric</em> curve.
				</li>
				<li>Double-click a state to toggle it between accepting and non-accepting.</li>
				<li>
					Click and drag on an empty area of the canvas to draw a selection box and select multiple
					items at once. Selected items can then be moved or deleted in a single action.
				</li>
			</ul>
		</li>
		<li>
			<div class="item-header">
				<span class="toolbar-item">
					<Spline class="h-4 w-4" /> Draw Edge
				</span>
				<span class="text-subtle">— keyboard shortcut:</span>
				<kbd>3</kbd>
			</div>
			<p class="text-normal">
				Allows drawing transition edges between two states. A single edge can 'hold' multiple
				transitions: you can add, edit, or remove individual transitions via the edge's context
				panel after drawing it.
				<br />
				<br />
				<strong>Note:</strong> duplicate edges (two edges with the same source state and target state)
				are not allowed. If you want to have multiple transitions between the same two states, add them
				to the same edge.
			</p>
		</li>
		<li>
			<div class="item-header">
				<span class="toolbar-item">
					<CirclePlus class="h-4 w-4" /> Add State
				</span>
				<span class="text-subtle">— keyboard shortcut:</span>
				<kbd>4</kbd>
			</div>
			<p class="text-normal">Allows to add new states by simply clicking anywhere on the canvas.</p>
		</li>
	</ul>
</section>

<!-- Keyboard shortcuts -->
<section id={MANUAL_SECTIONS.INTERFACE_SHORTCUTS.id} data-section class="subsection">
	<h3>{MANUAL_SECTIONS.INTERFACE_SHORTCUTS.title}</h3>
	<table class="shortcuts-table">
		<thead>
			<tr>
				<th class="text-left">Action</th>
				<th>Shortcut</th>
			</tr>
		</thead>
		<tbody>
			{#each SHORTCUTS as [action, shortcut], index (index)}
				<tr>
					<td>{action}</td>
					<td class="text-center">
						{#each shortcut as key, keyIndex (keyIndex)}
							<kbd>{key}</kbd>
							{keyIndex < shortcut.length - 1 ? ' + ' : ''}
						{/each}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</section>
