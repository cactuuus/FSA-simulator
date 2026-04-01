<script lang="ts">
	import { MANUAL_SECTIONS } from '$lib/utils/manual';
	import { CirclePlus, Spline, MousePointer } from '@lucide/svelte';
</script>

<section id={MANUAL_SECTIONS.HOW_TO.id} data-section class="section-header">
	<h2>{MANUAL_SECTIONS.HOW_TO.title}</h2>
</section>

<!-- How to add a state -->
<section id={MANUAL_SECTIONS.HOW_TO_ADD_STATE.id} data-section class="subsection">
	<h3>{MANUAL_SECTIONS.HOW_TO_ADD_STATE.title}</h3>
	<p class="text-normal">
		Select the <span class="toolbar-item"><CirclePlus class="h-4 w-4" />Add State</span> tool from the
		toolbar, then click anywhere on the canvas. A new state will be created at that location. If the FSA
		is currently empty, the newly added state will automatically be set as the start state.
	</p>
	<img
		src="/manual/how-to-add-state.avif"
		alt="How to add state demonstration"
		loading="lazy"
		class="bottom-spaced"
	/>
</section>

<!-- How to set the initial state -->
<section id={MANUAL_SECTIONS.HOW_TO_SET_INITIAL_STATE.id} data-section class="subsection">
	<h3>{MANUAL_SECTIONS.HOW_TO_SET_INITIAL_STATE.title}</h3>
	<p class="text-normal">
		You can set the intial state via its context panel.
		<br />
		Select the <span class="toolbar-item"><MousePointer class="h-4 w-4" />Select</span>
		tool and then click on the desired state. In the context panel that appears, check the
		<strong>Is Starting</strong> checkbox. This unset the previous start state (if any) and set the selected
		state as the new start state.
	</p>
	<img
		src="/manual/how-to-set-initial-state.avif"
		alt="How to set initial state demonstration"
		loading="lazy"
		class="bottom-spaced"
	/>
</section>

<!-- How to toggle accepting state -->
<section id={MANUAL_SECTIONS.HOW_TO_SET_ACCEPTING_STATE.id} data-section class="subsection">
	<h3>{MANUAL_SECTIONS.HOW_TO_SET_ACCEPTING_STATE.title}</h3>
	<p class="text-normal">
		You can toggle the accepting status of a state via its context panel.
		<br />
		Select the <span class="toolbar-item"><MousePointer class="h-4 w-4" />Select</span>
		tool and then click on the desired state. In the context panel that appears, check the
		<strong>Is Accepting</strong> checkbox. You can also do so by simply double-clicking the state while
		the select tool is active.
	</p>
	<img
		src="/manual/how-to-toggle-accepting-state.avif"
		alt="How to toggle accepting state demonstration"
		loading="lazy"
		class="bottom-spaced"
	/>
</section>

<!-- How to draw an edge -->
<section id={MANUAL_SECTIONS.HOW_TO_DRAW_EDGE.id} data-section class="subsection">
	<h3>{MANUAL_SECTIONS.HOW_TO_DRAW_EDGE.title}</h3>
	<p class="text-normal bottom-spaced">
		Select the <span class="toolbar-item"><Spline class="h-4 w-4" />Draw Edge</span> tool. Click on
		the source state and, while holding, drag to the target state. Release the mouse button to
		create the edge. To create a self-loop, you can simply click and release on the same state.
		<br />
		<strong>Note:</strong> if the edge you are trying to create already exists, then creation of the new
		edge will fail.
	</p>
	<img
		src="/manual/how-to-draw-edge.avif"
		alt="How to draw edge demonstration"
		loading="lazy"
		class="bottom-spaced"
	/>
</section>

<!-- How to manage transitions on an edge -->
<section id={MANUAL_SECTIONS.HOW_TO_MANAGE_TRANSITIONS.id} data-section class="subsection">
	<h3>{MANUAL_SECTIONS.HOW_TO_MANAGE_TRANSITIONS.title}</h3>
	<p class="text-normal bottom-spaced">
		You can manage transitions on an edge via its context panel.
		<br />
		Select the <span class="toolbar-item"><MousePointer class="h-4 w-4" />Select</span> tool and
		click an edge to open its context panel. From there you can add new transitions, edit existing
		ones, or remove them individually. Each transition defines the input symbol consumed (and, for
		PDAs, the stack operations).
		<br />
		<strong>Note:</strong> if you want to remove the last transition on an edge, you need to delete the
		edge itself, as edges must always have at least one transition.
	</p>
	<img
		src="/manual/how-to-manage-transitions.avif"
		alt="How to manage transitions demonstration"
		loading="lazy"
		class="bottom-spaced"
	/>
</section>

<!-- How to adjust edge shape -->
<section id={MANUAL_SECTIONS.HOW_TO_ADJUST_SHAPE.id} data-section class="subsection">
	<h3>{MANUAL_SECTIONS.HOW_TO_ADJUST_SHAPE.title}</h3>
	<p class="text-normal bottom-spaced">
		Select the <span class="toolbar-item"><MousePointer class="h-4 w-4" />Select</span> tool.
		<br />
		<strong>Moving states:</strong>
		<br />
		Clicking and dragging states moves them freely on the canvas, adjusting the connected edges accordingly.
		If multiple items (states and/or edges) are selected, they will be moved together.
		<br />
		<strong>Adjusting edges:</strong>
		<br />
		Clicking and dragging an edge to adjust its curvature. By default, the curve is adjusted freely, but
		holding <kbd>Shift</kbd> while dragging will snap it to a symmetric arc centered between the two source
		and target states. Note that self-loops shape cannot be adjusted, but you can use the same dragging
		action to rotate them around the state.
	</p>
	<img
		src="/manual/how-to-adjust-shape.avif"
		alt="How to adjust automaton shape demonstration"
		loading="lazy"
		class="bottom-spaced"
	/>
</section>
