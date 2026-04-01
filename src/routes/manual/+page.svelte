<script lang="ts">
	import { onMount } from 'svelte';
	import { BookOpen, PanelLeftOpen, PanelLeftClose, ArrowLeft } from '@lucide/svelte';
	import { MANUAL_SECTIONS, type ManualAnchor } from '$lib/utils/manual';
	import IntroductionSection from './sections/IntroductionSection.svelte';
	import InterfaceSection from './sections/InterfaceSection.svelte';
	import HowToSection from './sections/HowToSection.svelte';
	import TransitionTableSection from './sections/TransitionTableSection.svelte';
	import SimulationSection from './sections/SimulationSection.svelte';

	type Subsection = { id: ManualAnchor; title: string };
	type Section = { id: ManualAnchor; title: string; subsections?: Subsection[] };

	let activeId = $state<ManualAnchor>();
	const sections: Section[] = [
		{
			...MANUAL_SECTIONS.INTRODUCTION,
			subsections: [MANUAL_SECTIONS.WHAT_IS_AN_FSA, MANUAL_SECTIONS.TYPES_OF_AUTOMATA]
		},
		{
			...MANUAL_SECTIONS.INTERFACE,
			subsections: [
				MANUAL_SECTIONS.INTERFACE_OVERVIEW,
				MANUAL_SECTIONS.INTERFACE_TOOLBAR,
				MANUAL_SECTIONS.INTERFACE_SHORTCUTS
			]
		},
		{
			...MANUAL_SECTIONS.HOW_TO,
			subsections: [
				MANUAL_SECTIONS.HOW_TO_ADD_STATE,
				MANUAL_SECTIONS.HOW_TO_SET_INITIAL_STATE,
				MANUAL_SECTIONS.HOW_TO_SET_ACCEPTING_STATE,
				MANUAL_SECTIONS.HOW_TO_DRAW_EDGE,
				MANUAL_SECTIONS.HOW_TO_MANAGE_TRANSITIONS,
				MANUAL_SECTIONS.HOW_TO_ADJUST_SHAPE
			]
		},
		{
			...MANUAL_SECTIONS.TRANSITION_TABLE,
			subsections: [
				MANUAL_SECTIONS.TRANSITION_TABLE_DESCRIPTION,
				MANUAL_SECTIONS.TRANSITION_TABLE_HOW_TO_READ,
				MANUAL_SECTIONS.TRANSITION_TABLE_DESIRED_ALPHABET
			]
		},
		{
			...MANUAL_SECTIONS.SIMULATION,
			subsections: [MANUAL_SECTIONS.SIMULATION_COMPUTE_INPUT, MANUAL_SECTIONS.SIMULATION_PLAYBACK]
		}
	];

	onMount(() => {
		// Open the drawer by default on larger screens
		const drawer = document.getElementById('manual-drawer') as HTMLInputElement;
		if (drawer && window.innerWidth >= 1024) drawer.checked = true;

		// Set active section based on URL hash and update on scroll
		const hash = window.location.hash.slice(1) as ManualAnchor;
		if (hash) activeId = hash;
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) activeId = entry.target.id as ManualAnchor;
				}
			},
			{ rootMargin: '-10% 0px -75% 0px', threshold: 0 }
		);
		document.querySelectorAll('[data-section]').forEach((el) => observer.observe(el));
		return () => observer.disconnect();
	});

	function isParentActive(section: Section): boolean {
		if (activeId === section.id) return true;
		return section.subsections?.some((sub) => sub.id === activeId) ?? false;
	}
</script>

<div id="manual" class="drawer-open drawer h-dvh w-full bg-base-100 text-base-content">
	<input id="manual-drawer" type="checkbox" class="drawer-toggle" checked />

	<!-- Page content -->
	<div class="drawer-content flex flex-col overflow-hidden">
		<!-- Top bar -->
		<header class="flex h-12 items-center gap-3 border-b border-base-300 px-4 py-3">
			<BookOpen class="h-5 w-5 shrink-0 text-primary" />
			<span class="font-semibold">FSA Toolkit — Manual</span>
		</header>

		<main class="flex-1 overflow-y-auto">
			<div class="mx-auto max-w-5xl px-10 py-12">
				<IntroductionSection />
				<InterfaceSection />
				<HowToSection />
				<TransitionTableSection />
				<SimulationSection />
			</div>
		</main>
	</div>

	<!-- Sidebar -->
	<div class="drawer-side z-40 h-full">
		<aside
			class="flex h-full flex-col overflow-y-auto border-r border-base-300 bg-base-200 transition-[width] duration-400 is-drawer-close:w-12 is-drawer-open:w-64"
		>
			<!-- Header row -->
			<div
				class="flex h-12 items-center justify-center border-b border-base-300 is-drawer-open:px-2"
			>
				<div
					class="flex-1 items-center justify-between gap-2 is-drawer-close:hidden is-drawer-open:flex"
				>
					<span class="font-bold">Navigation</span>
					<label
						for="manual-drawer"
						class="btn btn-square btn-ghost"
						aria-label="Collapse sidebar"
						title="Hide navigation"
					>
						<PanelLeftClose class="h-4 w-4" />
					</label>
				</div>
				<label
					for="manual-drawer"
					class="btn btn-square btn-ghost is-drawer-open:hidden"
					aria-label="Expand sidebar"
					title="Show navigation"
				>
					<PanelLeftOpen class="h-4 w-4" />
				</label>
			</div>

			<!-- Navigation -->
			<nav class="flex-1 overflow-y-auto px-2 py-3 is-drawer-close:hidden">
				<ul class="menu w-full gap-0.5 menu-sm p-0">
					{#each sections as section, index (index)}
						<li>
							<a href="#{section.id}" class:active-section={isParentActive(section)}>
								{section.title}
							</a>
							{#if section.subsections}
								<ul>
									{#each section.subsections as sub, subIndex (subIndex)}
										<li>
											<a href="#{sub.id}" class:active-subsection={activeId === sub.id}>
												{sub.title}
											</a>
										</li>
									{/each}
								</ul>
							{/if}
						</li>
					{/each}
				</ul>
			</nav>

			<!-- Back to editor -->
			<div class="border-t border-base-300 px-2 py-3 is-drawer-close:hidden">
				<a href="/" class="btn w-full justify-start btn-ghost" title="Go to editor">
					<ArrowLeft class="h-4 w-4" />
					<span>Back to editor</span>
				</a>
			</div>
		</aside>
	</div>
</div>
