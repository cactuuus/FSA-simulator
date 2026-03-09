<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { createTimeline } from 'animejs';
	import type { SimulationController } from '$lib/interaction/SimulationController.svelte';
	import { Edge } from '$lib/automata/models';
	import { getGraphElement } from '$lib/utils/graphEffects';

	interface SimulationStep {
		nodeEl: SVGElement | null;
		edgeEl: SVGElement | null;
		transitionEl: SVGTSpanElement | null;
		group: number;
	}

	const { controller }: { controller: SimulationController } = $props();

	const EDGE_MS = 1000;
	const NODE_MS = 500;
	const NODE_OPACITY_MED = 0.8;
	const NODE_OPACITY_MAX = 1;
	let cancel: (() => void) | null = null;
	const steps = $derived.by<SimulationStep[]>(() => {
		return controller.nodePath.map((node) => {
			const parent = node.parent;
			const edgeId = parent
				? Edge.createId(parent.node.config.state.id, node.config.state.id)
				: 'start-edge';
			const group = node.config.group;
			return {
				nodeEl: getOverlayEl(node.config.state.id),
				edgeEl: getOverlayEl(edgeId),
				transitionEl: parent?.via ? getTransitionEl(parent.via.id) : null,
				group
			};
		});
	});

	function getColors() {
		const style = getComputedStyle(document.documentElement);
		return {
			accepted: style.getPropertyValue('--success-color') || 'oklch(76% 0.177 163.223)', // green
			rejected: style.getPropertyValue('--invalid-color') || 'oklch(57% 0.245 27.325)', // red
			active: style.getPropertyValue('--active-color') || 'oklch(65% 0.241 354.308)', // pink
			drawColor: style.getPropertyValue('--draw-color') || 'oklch(0% 0 0)' // black
		};
	}

	function getOverlayEl(id: string): SVGElement | null {
		return getGraphElement()?.querySelector(`[data-id="${id}"] .simulation-overlay`) ?? null;
	}

	function getTransitionEl(id: string): SVGTSpanElement | null {
		return getGraphElement()?.querySelector(`[data-id="${id}"]`) ?? null;
	}

	onMount(() => {
		const colors = getColors();
		const tl = createTimeline({
			autoplay: false,
			onUpdate: (self) => controller.setCurrentTime(self.currentTime),
			onComplete: () => controller.onPlaybackEnded()
		});
		let time = 0;
		let sourceEl: SVGElement | null = null;

		steps.forEach(({ nodeEl, edgeEl, transitionEl, group }) => {
			tl.call(() => controller.setCurrentGroup(group), time);

			// highlight edge and transition label
			if (edgeEl) {
				const length = (edgeEl as SVGPathElement).getTotalLength();
				edgeEl.style.strokeDasharray = String(length);
				tl.add(edgeEl, { opacity: [0, 1], stroke: colors.active, duration: 0 }, time);
				tl.add(
					edgeEl,
					{
						strokeDashoffset: [length, 0],
						duration: EDGE_MS,
						ease: 'inOut(2)'
					},
					time
				);
			}
			if (transitionEl) {
				tl.add(
					transitionEl,
					{
						fill: [colors.drawColor, colors.active],
						duration: 0
					},
					time
				);
			}
			time += EDGE_MS;

			const isLoopback = sourceEl === nodeEl && nodeEl !== null;
			// fade in target node (pulse if loopback)
			if (nodeEl) {
				tl.add(
					nodeEl,
					{
						fill: [colors.active, colors.active],
						opacity: isLoopback
							? [NODE_OPACITY_MED, NODE_OPACITY_MAX, NODE_OPACITY_MED]
							: [0, NODE_OPACITY_MED],
						duration: NODE_MS,
						ease: 'inOut(2)'
					},
					time
				);
			}
			time += NODE_MS;

			// fade out source node (if not isLoopback), edge and transition label
			if (sourceEl && !isLoopback) {
				tl.add(
					sourceEl,
					{
						fill: [colors.active, colors.active],
						opacity: [NODE_OPACITY_MED, 0],
						duration: NODE_MS,
						ease: 'inOut(2)'
					},
					time
				);
			}
			if (edgeEl) {
				tl.add(
					edgeEl,
					{
						opacity: [1, 0],
						duration: NODE_MS,
						ease: 'inOut(2)'
					},
					time
				);
			}
			if (transitionEl) {
				tl.add(
					transitionEl,
					{
						fill: [colors.active, colors.drawColor],
						duration: NODE_MS
					},
					time
				);
			}
			time += NODE_MS;
			sourceEl = nodeEl;
		});

		const lastStep = steps[steps.length - 1];
		tl.call(() => controller.setCurrentGroup(lastStep.group + 1), time);
		const lastEl = lastStep.nodeEl;

		// final node: accepted or rejected colour
		if (lastEl) {
			const finalColor = controller.isAccepting ? colors.accepted : colors.rejected;
			tl.add(
				lastEl,
				{
					fill: [finalColor, finalColor],
					opacity: [NODE_OPACITY_MED, NODE_OPACITY_MAX, NODE_OPACITY_MED],
					duration: NODE_MS,
					ease: 'inOut(2)'
				},
				time
			);
		}

		controller.registerTimeline(tl);

		cancel = () => {
			controller.stop();
			steps.forEach((step) => {
				const nodeEl = step.nodeEl;
				if (nodeEl) {
					nodeEl.style.opacity = '0';
					nodeEl.style.fill = colors.drawColor;
				}
				const edgeEl = step.edgeEl;
				if (edgeEl) {
					edgeEl.style.opacity = '0';
					edgeEl.style.strokeDasharray = '';
				}
				const transitionEl = step.transitionEl;
				if (transitionEl) {
					transitionEl.style.fill = colors.drawColor;
				}
			});
		};
	});

	onDestroy(() => cancel?.());
</script>
