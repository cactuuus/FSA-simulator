import { describe, it, expect } from 'vitest';
import { FSAGraph, FSAType, Transition } from '$lib/automata-models';
import { DFA, NFA, DPDA, PDA } from '../fsa-examples';
import { withReactivity } from '../helpers.svelte';

// --- Node management

describe('FSAGraph - node management', () => {
	it('first node created becomes the start node', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			const node = fsa.createNewNode({ x: 0, y: 0 }, 'node-0');
			expect(fsa.startNode?.id).toBe(node.id);
		});
	});

	it('newer nodes do not override the start node', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			const first = fsa.createNewNode({ x: 0, y: 0 }, 'node-0');
			fsa.createNewNode({ x: 100, y: 0 }, 'node-1');
			expect(fsa.startNode?.id).toBe(first.id);
		});
	});

	it('throws when adding a node with a duplicate id', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			fsa.createNewNode({ x: 0, y: 0 }, 'node-0');
			expect(() => fsa.createNewNode({ x: 100, y: 0 }, 'node-0')).toThrow();
		});
	});

	it('deleting a node removes it from the graph', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			const node = fsa.createNewNode({ x: 0, y: 0 }, 'node-0');
			fsa.deleteNode(node.id);
			expect(fsa.nodes).toHaveLength(0);
		});
	});

	it('deleting a node cascades to all connected edges', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			const q0 = fsa.createNewNode({ x: 0, y: 0 }, 'node-0');
			const q1 = fsa.createNewNode({ x: 100, y: 0 }, 'node-1');
			const q2 = fsa.createNewNode({ x: 200, y: 0 }, 'node-2');
			fsa.createNewEdge(q0, q1);
			fsa.createNewEdge(q1, q2);
			fsa.createNewEdge(q0, q2);
			fsa.deleteNode(q1.id);
			expect(fsa.edges.every((e) => e.from.id !== q1.id && e.to.id !== q1.id)).toBe(true);
		});
	});

	it('deleting the start node clears startNode', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			const node = fsa.createNewNode({ x: 0, y: 0 }, 'node-0');
			fsa.deleteNode(node.id);
			expect(fsa.startNode).toBe(null);
		});
	});
});

// --- Edge management

describe('FSAGraph - edge management', () => {
	it('throws when creating a duplicate edge', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			const q0 = fsa.createNewNode({ x: 0, y: 0 }, 'node-0');
			const q1 = fsa.createNewNode({ x: 100, y: 0 }, 'node-1');
			fsa.createNewEdge(q0, q1);
			expect(() => fsa.createNewEdge(q0, q1)).toThrow();
		});
	});

	it('throws when creating an edge with a non-existent source and/or target node', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			const q0 = fsa.createNewNode({ x: 0, y: 0 }, 'node-0');
			const q1 = fsa.createNewNode({ x: 100, y: 0 }, 'node-1');
			fsa.deleteNode(q0.id);
			expect(() => fsa.createNewEdge(q0, q1)).toThrow(); // no source
			expect(() => fsa.createNewEdge(q1, q0)).toThrow(); // no target
			expect(() => fsa.createNewEdge(q1, q1)).toThrow(); // no source and no target
		});
	});

	it('deleting an edge removes it from the graph', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			const q0 = fsa.createNewNode({ x: 0, y: 0 }, 'node-0');
			const q1 = fsa.createNewNode({ x: 100, y: 0 }, 'node-1');
			const edge = fsa.createNewEdge(q0, q1);
			fsa.deleteEdge(edge.id);
			expect(fsa.edges).toHaveLength(0);
		});
	});

	it('deleting an edge removes all attached transitions', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			const q0 = fsa.createNewNode({ x: 0, y: 0 }, 'node-0');
			const q1 = fsa.createNewNode({ x: 100, y: 0 }, 'node-1');
			const edge = fsa.createNewEdge(q0, q1);
			edge.addEmptyTransition(false, 't0');
			edge.addEmptyTransition(false, 't1');
			expect(fsa.transitions).toHaveLength(2);
			fsa.deleteEdge(edge.id);
			expect(fsa.transitions).toHaveLength(0);
		});
	});
});

// --- Stack operations

describe('FSAGraph - stack ops', () => {
	it('enabling stack ops propagates to all existing transitions', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			const q0 = fsa.createNewNode({ x: 0, y: 0 }, 'node-0');
			const q1 = fsa.createNewNode({ x: 100, y: 0 }, 'node-1');
			fsa.createNewEdge(q0, q1);
			fsa.hasStackOps = true;
			expect(fsa.transitions.every((t) => t.hasStackOps())).toBe(true);
		});
	});

	it('disabling stack ops removes stack ops from all transitions', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			const q0 = fsa.createNewNode({ x: 0, y: 0 }, 'node-0');
			const q1 = fsa.createNewNode({ x: 100, y: 0 }, 'node-1');
			fsa.createNewEdge(q0, q1);
			fsa.hasStackOps = true;
			fsa.hasStackOps = false;
			expect(fsa.transitions.every((t) => !t.hasStackOps())).toBe(true);
		});
	});

	it('new edges created after enabling stack ops get stack-op enabled transitions', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			fsa.hasStackOps = true;
			const q0 = fsa.createNewNode({ x: 0, y: 0 }, 'node-0');
			const q1 = fsa.createNewNode({ x: 100, y: 0 }, 'node-1');
			const edge = fsa.createNewEdge(q0, q1);
			expect(edge.transitions[0].hasStackOps()).toBe(true);
		});
	});
});

// --- Types & Determinism

describe('FSAGraph - types and determinism', () => {
	it('DFA example is correctly identified as a DFA', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			fsa.loadFromJSON(DFA);
			expect(fsa.type).toBe(FSAType.DFA);
			expect(fsa.isDeterministic).toBe(true);
		});
	});

	it('NFA example is correctly identified as an NFA', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			fsa.loadFromJSON(NFA);
			expect(fsa.type).toBe(FSAType.NFA);
			expect(fsa.isDeterministic).toBe(false);
		});
	});

	it('DPDA example is correctly identified as a DPDA', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			fsa.loadFromJSON(DPDA);
			expect(fsa.type).toBe(FSAType.DPDA);
			expect(fsa.isDeterministic).toBe(true);
		});
	});

	it('PDA example is correctly identified as a PDA', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			fsa.loadFromJSON(PDA);
			expect(fsa.type).toBe(FSAType.PDA);
			expect(fsa.isDeterministic).toBe(false);
		});
	});
});

// --- Alphabet

describe('FSAGraph - alphabet', () => {
	it('returns correct input symbols', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			const q0 = fsa.createNewNode({ x: 0, y: 0 }, 'node-0');
			const q1 = fsa.createNewNode({ x: 100, y: 0 }, 'node-1');
			const edge = fsa.createNewEdge(q0, q1);
			edge.addTransitions(
				new Transition('0', null, null, 't0'),
				new Transition('1', null, null, 't1')
			);
			expect(fsa.alphabet()).toEqual(new Set(['0', '1']));
		});
	});

	it('excludes epsilon by default', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			const q0 = fsa.createNewNode({ x: 0, y: 0 }, 'node-0');
			const q1 = fsa.createNewNode({ x: 100, y: 0 }, 'node-1');
			const edge = fsa.createNewEdge(q0, q1);
			edge.addTransitions(
				new Transition('0', null, null, 't0'),
				new Transition(Transition.EPSILON, null, null, 't1')
			);
			expect(fsa.alphabet().has(Transition.EPSILON)).toBe(false);
		});
	});

	it('includes epsilon when flag is set', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			const q0 = fsa.createNewNode({ x: 0, y: 0 }, 'node-0');
			const q1 = fsa.createNewNode({ x: 100, y: 0 }, 'node-1');
			const edge = fsa.createNewEdge(q0, q1);
			edge.addTransitions(
				new Transition('0', null, null, 't0'),
				new Transition(Transition.EPSILON, null, null, 't1')
			);
			expect(fsa.alphabet(true).has(Transition.EPSILON)).toBe(true);
		});
	});
});

// --- Serialization

describe('FSAGraph - serialization', () => {
	it('save/restore preserves node count, edge count, and start node', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			fsa.loadFromJSON(DFA);
			const restored = new FSAGraph();
			restored.loadFromJSON(fsa.toJSON());
			expect(restored.nodes).toHaveLength(fsa.nodes.length);
			expect(restored.edges).toHaveLength(fsa.edges.length);
			expect(restored.startNode?.id).toBe(fsa.startNode?.id);
		});
	});

	it('save/restore preserves node labels and accepting states', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			fsa.loadFromJSON(DFA);
			const restored = new FSAGraph();
			restored.loadFromJSON(fsa.toJSON());
			fsa.nodes.forEach((node) => {
				const restoredNode = restored.getNode(node.id);
				expect(restoredNode?.label).toBe(node.label);
				expect(restoredNode?.isAccepting).toBe(node.isAccepting);
			});
		});
	});

	it('save/restore of a PDA preserves stack ops on all transitions', () => {
		withReactivity(() => {
			const fsa = new FSAGraph();
			fsa.loadFromJSON(PDA);
			const restored = new FSAGraph();
			restored.loadFromJSON(fsa.toJSON());
			expect(restored.transitions.every((t) => t.hasStackOps())).toBe(true);
		});
	});
});
