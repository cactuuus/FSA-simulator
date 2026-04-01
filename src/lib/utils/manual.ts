import { resolve } from '$app/paths';

export const MANUAL_SECTIONS = {
	// Title
	TITLE: { id: 'title', title: 'FSA Toolkit — Manual' },

	// Introduction
	INTRODUCTION: { id: 'introduction-section', title: 'Introduction' },
	WHAT_IS_AN_FSA: { id: 'what-is-an-fsa-section', title: 'What is an FSA?' },
	TYPES_OF_AUTOMATA: { id: 'types-of-automata-section', title: 'Types of Automata' },
	KEY_TERMINOLOGY: { id: 'key-terminology-section', title: 'Key Terminology' },

	// Interface
	INTERFACE: { id: 'interface-section', title: 'Interface' },
	INTERFACE_OVERVIEW: { id: 'interface-overview-section', title: 'Overview' },
	INTERFACE_TOOLBAR: { id: 'interface-toolbar-section', title: 'Toolbar' },
	INTERFACE_SHORTCUTS: { id: 'interface-shortcuts-section', title: 'Keyboard Shortcuts' },

	// How to
	HOW_TO: { id: 'how-to-section', title: 'How to' },
	HOW_TO_ADD_STATE: { id: 'add-a-state-section', title: 'Add a State' },
	HOW_TO_SET_INITIAL_STATE: { id: 'set-start-state-section', title: 'Set Start State' },
	HOW_TO_SET_ACCEPTING_STATE: {
		id: 'set-accepting-state-section',
		title: 'Toggle Accepting State'
	},
	HOW_TO_DRAW_EDGE: { id: 'draw-an-edge-section', title: 'Draw an Edge' },
	HOW_TO_MANAGE_TRANSITIONS: { id: 'edit-transitions-section', title: 'Edit Transitions' },
	HOW_TO_ADJUST_SHAPE: { id: 'adjust-shape-section', title: 'Adjusting Automaton Shape' },

	// Transition Table
	TRANSITION_TABLE: { id: 'transition-table-section', title: 'Transition Table' },
	TRANSITION_TABLE_DESCRIPTION: {
		id: 'transition-table-description-section',
		title: 'What is it?'
	},
	TRANSITION_TABLE_HOW_TO_READ: {
		id: 'transition-table-how-to-read-section',
		title: 'Examples'
	},
	TRANSITION_TABLE_DESIRED_ALPHABET: {
		id: 'transition-table-desired-alphabet-section',
		title: 'Desired Alphabet'
	},

	// Simulation
	SIMULATION: { id: 'simulation-section', title: 'Simulation' },
	SIMULATION_COMPUTE_INPUT: { id: 'simulation-compute-input-section', title: 'Compute Input' },
	SIMULATION_PLAYBACK: { id: 'simulation-playback-section', title: 'Simulation Playback' }
} as const;

export type ManualSection = (typeof MANUAL_SECTIONS)[keyof typeof MANUAL_SECTIONS];
export type ManualAnchor = ManualSection['id'];

export function manualHref(section?: ManualSection): string {
	const base = resolve('/manual');
	return section ? `${base}#${section.id}` : base;
}
