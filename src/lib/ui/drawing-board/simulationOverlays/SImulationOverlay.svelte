<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { SimulationController } from '$lib/interaction/SimulationController.svelte';
	import { Edge } from '$lib/automata/models';
	import { getGraphElement } from '$lib/utils/graphEffects';

	const { controller }: { controller: SimulationController } = $props();

	const EDGE_MS = 1000;
	const NODE_MS = EDGE_MS * 0.5;
	const NODE_OPACITY_MED = 0.7;
	const NODE_OPACITY_MAX = 1;
	let allAnimations: Animation[] = [];

	$effect(() => {
		const speed = controller.settings.speed;
		allAnimations.forEach((a) => (a.playbackRate = speed));
	});

	function getColors() {
		const style = getComputedStyle(document.documentElement);
		return {
			accepted: style.getPropertyValue('--success-color') || 'oklch(0.72 0.19 142)',
			rejected: style.getPropertyValue('--invalid-color') || 'oklch(0.72 0.19 10)',
			active: style.getPropertyValue('--highlight-color') || 'oklch(0.72 0.19 250)'
		};
	}

	function getOverlayEl(id: string): SVGCircleElement | null {
		return getGraphElement()?.querySelector(`[data-id="${id}"] .simulation-overlay`) ?? null;
	}

	function getTransitionEl(id: string): SVGTSpanElement | null {
		return getGraphElement()?.querySelector(`[data-id="${id}"]`) ?? null;
	}

	function animate(
		el: Element,
		keyframes: Keyframe[],
		delay: number,
		duration: number,
		fill: FillMode = 'none'
	): Animation {
		const anim = el.animate(keyframes, { duration, delay, fill, easing: 'ease-in-out' });
		anim.playbackRate = controller.settings.speed;
		anim.pause();
		allAnimations.push(anim);
		return anim;
	}

	function buildAnimations() {
		allAnimations.forEach((a) => a.cancel());
		allAnimations = [];
		const colors = getColors();
		const path = controller.nodePath;

		// fetch all elements upfront
		const steps = path.map((node) => {
			const parent = node.parent;
			const edgeId = parent
				? Edge.createId(parent.node.config.state.id, node.config.state.id)
				: 'start-edge';
			return {
				nodeEl: getOverlayEl(node.config.state.id),
				edgeEl: getOverlayEl(edgeId),
				transitionEl: parent?.via ? getTransitionEl(parent.via.id) : null
			};
		});

		let time = 0;
		let sourceEl: SVGCircleElement | null = null;
		steps.forEach(({ nodeEl, edgeEl, transitionEl }, i) => {
			const loop = sourceEl === nodeEl && nodeEl !== null;
			if (transitionEl) {
				animate(
					transitionEl,
					[{ fill: colors.active }, { fill: colors.active }], // hold colour
					time,
					0,
					'forwards'
				);
			}
			// animate edge
			if (edgeEl) {
				const length = edgeEl.getTotalLength();
				edgeEl.style.strokeDasharray = String(length);
				animate(
					edgeEl,
					[
						{ strokeDashoffset: length, opacity: 1, stroke: colors.active },
						{ strokeDashoffset: 0, opacity: 1, stroke: colors.active }
					],
					time,
					EDGE_MS,
					'forwards'
				);
			}
			time += EDGE_MS;

			// animate target node
			if (nodeEl && loop) {
				// pulse if visiting the same node again
				animate(
					nodeEl,
					[
						{ fill: colors.active, opacity: NODE_OPACITY_MED },
						{ fill: colors.active, opacity: NODE_OPACITY_MAX },
						{ fill: colors.active, opacity: NODE_OPACITY_MED }
					],
					time,
					NODE_MS,
					'forwards'
				);
			} else if (nodeEl) {
				animate(
					nodeEl,
					[
						{ fill: colors.active, opacity: 0 },
						{ fill: colors.active, opacity: NODE_OPACITY_MAX },
						{ fill: colors.active, opacity: NODE_OPACITY_MED }
					],
					time,
					NODE_MS,
					'forwards'
				);
			}
			time += NODE_MS;

			// Fade out source + edge simultaneously
			if (sourceEl && !loop) {
				animate(
					sourceEl,
					[{ opacity: NODE_OPACITY_MED }, { opacity: 0 }],
					time,
					NODE_MS,
					'forwards'
				);
			}
			if (edgeEl) {
				animate(edgeEl, [{ opacity: 1 }, { opacity: 0 }], time, NODE_MS, 'forwards');
			}
			if (transitionEl) {
				animate(transitionEl, [{ fill: colors.active }, { fill: '' }], time, 0, 'forwards');
			}
			time += NODE_MS;
			sourceEl = nodeEl;
		});

		// paint final node with accepted or rejected colour
		const lastEl = steps[steps.length - 1].nodeEl;
		if (lastEl) {
			const finalColor = controller.isAccepting ? colors.accepted : colors.rejected;
			animate(
				lastEl,
				[
					{ fill: colors.active, opacity: NODE_OPACITY_MED },
					{ fill: finalColor, opacity: NODE_OPACITY_MAX },
					{ fill: finalColor, opacity: NODE_OPACITY_MED }
				],
				time,
				NODE_MS,
				'forwards'
			);
		}
		time += NODE_MS;

		controller.registerAnimationControls({
			play: () => allAnimations.forEach((a) => a.play()),
			pause: () => allAnimations.forEach((a) => a.pause()),
			scrubTo: (ms) =>
				allAnimations.forEach((a) => {
					a.pause();
					a.currentTime = ms;
				}),
			totalDuration: time
		});
	}

	function cleanup() {
		allAnimations.forEach((a) => a.cancel());
		// reset any lingering dasharray on edge overlay elements
		controller.nodePath.forEach((node, i) => {
			if (i === 0) return;
			const prev = controller.nodePath[i - 1];
			const edgeId = Edge.createId(prev.config.state.id, node.config.state.id);
			const edgeEl = getOverlayEl(edgeId);
			if (edgeEl) {
				edgeEl.style.strokeDasharray = '';
				edgeEl.style.opacity = '0';
			}
		});
		// reset node overlay elements
		controller.nodePath.forEach((node) => {
			const nodeEl = getOverlayEl(node.config.state.id);
			if (nodeEl) nodeEl.style.opacity = '0';
		});
	}

	onMount(buildAnimations);
	onDestroy(cleanup);
</script>
