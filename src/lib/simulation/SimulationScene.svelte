<script lang="ts">
	import { onMount } from 'svelte';
	import { createTimeline } from 'animejs';
	import { SimulationController } from './SimulationController.svelte';
	import { Edge, type FSAGraph, Transition } from '$lib/automata-models';
	import { getGraphElement } from '$lib/utils/graphEffects';

	const { controller, fsa }: { controller: SimulationController; fsa: FSAGraph } = $props();

	const EDGE_MS = 1000;
	const NODE_MS = 500;
	const STACK_MS = 500;
	const STACK_MOVE = 8;
	const NODE_OPACITY_MED = 0.8;
	const NODE_OPACITY_MAX = 1;

	const maxStackDepth = $derived(
		fsa.hasStackOps ? Math.max(0, ...controller.path.nodes.map((n) => n.config.stack.length)) : 0
	);
	let stackEls: (HTMLDivElement | null)[] = $derived(
		Array.from({ length: maxStackDepth }, () => null)
	);

	function getColors() {
		const style = getComputedStyle(document.documentElement);
		return {
			accepted: style.getPropertyValue('--success-color') || 'oklch(76% 0.177 163.223)',
			rejected: style.getPropertyValue('--invalid-color') || 'oklch(57% 0.245 27.325)',
			active: style.getPropertyValue('--active-color') || 'oklch(65% 0.241 354.308)',
			drawColor: style.getPropertyValue('--draw-color') || 'oklch(0% 0 0)',
			cellBase: style.getPropertyValue('--color-base-200') || 'oklch(96% 0.1 261.176)'
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
		let stackPointer = -1;

		controller.path.nodes.forEach((node) => {
			const parent = node.parent;
			const transition = parent?.via ?? null;
			const edgeId = parent
				? Edge.createId(parent.node.config.state.id, node.config.state.id)
				: 'start-edge';
			const nodeEl = getOverlayEl(node.config.state.id);
			const edgeEl = getOverlayEl(edgeId);
			const transitionEl = transition ? getTransitionEl(transition.id) : null;
			const pushed =
				transition?.push && transition.push !== Transition.EPSILON ? transition.push : null;
			const popped =
				transition?.pop && transition.pop !== Transition.EPSILON ? transition.pop : null;

			tl.call(() => controller.setCurrentGroup(node.config.group), time);

			// edge animation
			if (edgeEl) {
				const edgeLength = (edgeEl as SVGPathElement).getTotalLength();
				edgeEl.style.strokeDasharray = String(edgeLength);
				tl.add(edgeEl, { opacity: [0, 1], stroke: colors.active, duration: 0 }, time);
				tl.add(edgeEl, { strokeDashoffset: [edgeLength, 0], duration: EDGE_MS }, time);

				// stack animation
				if (fsa.hasStackOps) {
					const popStart = time;
					const popEnd = time + STACK_MS - 1;
					const pushStart = popEnd + 1; // +1 to ensure no conflicts in animations
					const pushEnd = pushStart + STACK_MS;
					if (popped) {
						const slotIndex = stackPointer;
						const stackEl = stackEls[slotIndex];
						if (stackEl) {
							tl.add(
								stackEl,
								{
									textContent: popped,
									backgroundColor: colors.rejected,
									display: 'flex',
									duration: 0
								},
								popStart
							);
							tl.add(
								stackEl,
								{
									opacity: [1, 0],
									translateY: [0, -STACK_MOVE],
									duration: STACK_MS
								},
								popStart
							);
							tl.add(
								stackEl,
								{
									textContent: '',
									backgroundColor: colors.cellBase,
									display: 'none',
									duration: 0
								},
								popEnd
							);
						}
						stackPointer--;
					}
					if (pushed) {
						stackPointer++;
						const slotIndex = stackPointer;
						const stackEl = stackEls[slotIndex];
						if (stackEl) {
							// this first 'add' simply is there so when rewinding the timeline, it resets the state of this stack cell (hence why the -1 as well)
							tl.add(stackEl, { display: 'none', duration: 0 }, pushStart - 1);
							tl.add(
								stackEl,
								{
									backgroundColor: colors.accepted,
									textContent: pushed,
									display: 'flex',
									duration: 0
								},
								pushStart
							);
							tl.add(
								stackEl,
								{
									opacity: [0, 1],
									translateY: [-8, 0],
									duration: EDGE_MS / 2
								},
								pushStart
							);
							tl.add(stackEl, { backgroundColor: colors.cellBase, duration: 0 }, pushEnd);
						}
					}
				}
			}
			if (transitionEl) {
				tl.add(transitionEl, { fill: [colors.drawColor, colors.active], duration: 0 }, time);
			}
			time += EDGE_MS;

			// node animation
			const isLoopback = sourceEl === nodeEl && nodeEl !== null;
			if (nodeEl) {
				tl.add(
					nodeEl,
					{
						fill: [colors.active, colors.active],
						opacity: isLoopback
							? [NODE_OPACITY_MED, NODE_OPACITY_MAX, NODE_OPACITY_MED]
							: [0, NODE_OPACITY_MED],
						duration: NODE_MS
					},
					time
				);
			}
			time += NODE_MS;

			if (sourceEl && !isLoopback) {
				tl.add(
					sourceEl,
					{
						fill: [colors.active, colors.active],
						opacity: [NODE_OPACITY_MED, 0],
						duration: NODE_MS
					},
					time
				);
			}
			if (edgeEl) {
				tl.add(edgeEl, { opacity: [1, 0], duration: NODE_MS }, time);
			}
			if (transitionEl) {
				tl.add(transitionEl, { fill: [colors.active, colors.drawColor], duration: NODE_MS }, time);
			}
			time += NODE_MS;
			sourceEl = nodeEl;
		});

		// final node colour
		const lastNode = controller.path.nodes[controller.path.nodes.length - 1];
		const lastNodeEl = getOverlayEl(lastNode.config.state.id);
		tl.call(() => controller.setCurrentGroup(lastNode.config.group + 1), time);
		const finalColor = controller.path.isAccepting ? colors.accepted : colors.rejected;
		if (lastNodeEl) {
			tl.add(lastNodeEl, { fill: finalColor, duration: 0 }, time);
			tl.add(
				lastNodeEl,
				{ opacity: [NODE_OPACITY_MAX, NODE_OPACITY_MED], duration: NODE_MS },
				time
			);
		}
		if (fsa.hasStackOps) {
			stackEls.forEach((cell) => {
				if (cell) {
					tl.add(cell, { backgroundColor: colors.cellBase, duration: 0 }, time);
					tl.add(cell, { backgroundColor: finalColor, duration: NODE_MS }, time);
				}
			});
		}
		controller.registerTimeline(tl);

		return () => {
			// cleanup -- stop the timeline and reset all styles
			controller.stop();
			controller.path.nodes.forEach((node) => {
				const parent = node.parent;
				const edgeId = parent
					? Edge.createId(parent.node.config.state.id, node.config.state.id)
					: 'start-edge';
				const nodeEl = getOverlayEl(node.config.state.id);
				const edgeEl = getOverlayEl(edgeId);
				const transitionEl = parent?.via ? getTransitionEl(parent.via.id) : null;
				if (nodeEl) {
					nodeEl.style.opacity = '0';
					nodeEl.style.fill = '';
				}
				if (edgeEl) {
					edgeEl.style.opacity = '0';
					edgeEl.style.strokeDasharray = '';
				}
				if (transitionEl) {
					transitionEl.style.fill = '';
				}
			});
		};
	});
</script>

{#if fsa.hasStackOps}
	<div
		class="absolute top-1/2 right-2 flex max-h-[80dvh] -translate-y-1/2 flex-col gap-1 overflow-y-auto rounded-box bg-base-100/90 p-2 shadow backdrop-blur-xs"
	>
		<span class="text-center text-base-content/70">stack</span>
		<div class="divider mx-0 divider-horizontal w-20 border border-base-content/50"></div>
		<!-- slots rendered bottom-to-top: index 0 at bottom, maxDepth-1 at top -->
		<div class="flex flex-col-reverse gap-1">
			{#each stackEls as _, i (i)}
				<div
					bind:this={stackEls[i]}
					class="flex h-8 w-20 items-center justify-center rounded-box bg-base-200 text-sm font-semibold"
					style:opacity="0"
					style:display="none"
				></div>
			{/each}
		</div>
	</div>
{/if}
