<script lang="ts">
	import { onMount } from 'svelte';
	import { BookOpen, PanelLeftOpen, PanelLeftClose, ArrowLeft } from '@lucide/svelte';
	import { MANUAL_SECTIONS, type ManualAnchor } from '$lib/utils/manual';
	import IntroductionSection from './sections/IntroductionSection.svelte';
	import InterfaceSection from './sections/InterfaceSection.svelte';
	import HowToSection from './sections/HowToSection.svelte';
	import TransitionTableSection from './sections/TransitionTableSection.svelte';
	import SimulationSection from './sections/SimulationSection.svelte';
	import { replaceState } from '$app/navigation';

	type Subsection = { id: ManualAnchor; title: string };
	type Section = { id: ManualAnchor; title: string; subsections?: Subsection[] };

	const NAV_BAR_SCREEN_THRESHOLD = 1024;
	const TOP_PADDING = 60; // accounting for header height plus some extra spacing
	let activeSection = $state<ManualAnchor>();
	let mainElement: HTMLElement;

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

	function scrollToHash(hash: string) {
		const section = document.getElementById(hash);
		if (!mainElement || !section) return;
		mainElement.scrollTo({ top: section.offsetTop - TOP_PADDING, behavior: 'instant' });
		activeSection = hash as ManualAnchor;
		// Update URL hash without triggering another scroll
		replaceState('', `#${activeSection}`);
	}

	function handleNavClick(e: MouseEvent, id: string) {
		e.preventDefault();
		scrollToHash(id);
		// Close drawer on mobile after navigating
		if (window.innerWidth < NAV_BAR_SCREEN_THRESHOLD) {
			const drawer = document.getElementById('manual-drawer') as HTMLInputElement;
			if (drawer) drawer.checked = false;
		}
	}

	function isParentActive(section: Section): boolean {
		if (activeSection === section.id) return true;
		return section.subsections?.some((sub) => sub.id === activeSection) ?? false;
	}

	onMount(() => {
		// Open the drawer by default on larger screens
		const drawer = document.getElementById('manual-drawer') as HTMLInputElement;
		if (drawer && window.innerWidth < NAV_BAR_SCREEN_THRESHOLD) drawer.checked = false;

		// Handle initial hash
		const hash = window.location.hash.slice(1);
		if (hash) setTimeout(() => scrollToHash(hash), 50); // slight delay to ensure elements are rendered

		// Update active section on scroll
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) activeSection = entry.target.id as ManualAnchor;
				}
			},
			{ rootMargin: '-20% 0px -80% 0px', threshold: 0 }
		);
		document.querySelectorAll('[data-section]').forEach((el) => observer.observe(el));

		return () => observer.disconnect();
	});
</script>

<div id="manual" class="drawer h-dvh w-full bg-base-100 text-base-content md:drawer-open">
	<input id="manual-drawer" type="checkbox" class="drawer-toggle" checked />

	<!-- Page content -->
	<div class="drawer-content flex flex-col overflow-hidden pt-12 md:pt-0">
		<!-- Top bar -->
		<header
			class="fixed top-0 flex h-12 w-full shrink-0 items-center gap-3 border-b-2 border-base-300 bg-base-200 md:static md:px-4"
		>
			<label
				for="manual-drawer"
				class="flex h-12 w-12 items-center justify-center self-start border-r-2 border-base-300 p-0! md:hidden"
				aria-label="Open navigation"
			>
				<PanelLeftOpen class="h-5 w-5" />
			</label>
			<BookOpen class="h-5 w-5 shrink-0 text-primary" />
			<span class="font-bold">FSA Toolkit — Manual</span>
		</header>

		<main bind:this={mainElement} class="flex-1 overflow-y-auto">
			<div class="mx-auto max-w-7xl px-2 py-4 md:px-10 md:py-12">
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
		<label for="manual-drawer" aria-label="Close navigation" class="drawer-overlay md:hidden"
		></label>

		<aside
			class="flex h-full flex-col border-r-2 border-base-300 bg-base-200 transition-[width] duration-300 md:is-drawer-close:w-12 md:is-drawer-open:w-64"
		>
			<!-- Sidebar header -->
			<div class="flex h-12 shrink-0 items-center justify-center border-b-2 border-base-300">
				<div class="flex-1 items-center gap-2 px-2 is-drawer-close:hidden is-drawer-open:flex">
					<span class="flex-1 font-bold">Navigation</span>
					<label
						for="manual-drawer"
						class="btn btn-square btn-ghost"
						aria-label="Collapse navigation"
					>
						<PanelLeftClose class="h-5 w-5" />
					</label>
				</div>
				<label
					for="manual-drawer"
					class="btn btn-square btn-ghost is-drawer-open:hidden"
					aria-label="Expand navigation"
				>
					<PanelLeftOpen class="h-5 w-5" />
				</label>
			</div>

			<!-- Navigation -->
			<nav class="flex-1 overflow-y-auto px-2 py-3 is-drawer-close:hidden">
				<ul class="menu w-full gap-0.5 p-0">
					{#each sections as section, index (index)}
						<li>
							<a
								href="#{section.id}"
								class:active-section={isParentActive(section)}
								onclick={(e) => handleNavClick(e, section.id)}
							>
								{section.title}
							</a>
							{#if section.subsections}
								<ul>
									{#each section.subsections as sub, subIndex (subIndex)}
										<li>
											<a
												href="#{sub.id}"
												class:active-subsection={activeSection === sub.id}
												onclick={(e) => handleNavClick(e, sub.id)}
											>
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
			<div
				class="flex items-center justify-center border-t-2 border-base-300 px-2 py-1 is-drawer-close:hidden"
			>
				<a href="/" class="btn w-full justify-start btn-link" title="Go to editor">
					<ArrowLeft class="h-5 w-5" />
					<span>Back to editor</span>
				</a>
			</div>
		</aside>
	</div>
</div>
