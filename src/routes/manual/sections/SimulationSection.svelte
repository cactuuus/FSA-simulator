<script lang="ts">
	import { MANUAL_SECTIONS } from '$lib/utils/manual';
</script>

<section id={MANUAL_SECTIONS.SIMULATION.id} data-section class="section-header">
	<h2>{MANUAL_SECTIONS.SIMULATION.title}</h2>
</section>

<!-- Compute Input -->
<section id={MANUAL_SECTIONS.SIMULATION_COMPUTE_INPUT.id} data-section class="subsection">
	<h3>{MANUAL_SECTIONS.SIMULATION_COMPUTE_INPUT.title}</h3>
	<p class="text-normal bottom-spaced">
		To simulate an input through the automaton, first open the <strong>Compute Input</strong> window
		(you can find it in the main menu).
		<br />
		With the compute input window open, you can enter an input string and click the
		<strong>Compute</strong> to process it through the automaton. This will list all the possible paths
		that the automaton can take to process the input, separated between accepting and rejecting paths.
		You can click on any of the listed paths to start a step-by-step simulation of that path.
	</p>
	<p class="alert block alert-soft alert-warning">
		<strong>Note:</strong> For pushdown automata, you can also adjust the
		<em>Max loops iterations</em> parameter, which will stop the simulation if an infinite loop is detected,
		after the specified number of iterations. This is because pushdown automata can have a specific type
		of infinite loop, where the stack content grows infinitely. This is particularly problematic because
		in some situations, a valid input might only be accepted after a long sequence of loops, meaning we
		can't simply ignore them.
	</p>
</section>

<!-- Playback -->
<section id={MANUAL_SECTIONS.SIMULATION_PLAYBACK.id} data-section class="subsection">
	<h3>{MANUAL_SECTIONS.SIMULATION_PLAYBACK.title}</h3>
	<img src="/manual/simulation-playback.avif" alt="Simulation playback" />
	<p class="text-normal bottom-spaced">
		Once you have selected a path to simulate, the simulation playback will open. This will hide all
		editing controls and display a simulation panel at the top of the screen.
	</p>
</section>
