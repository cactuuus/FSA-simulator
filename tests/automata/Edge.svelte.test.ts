import { describe, it, expect } from 'vitest';
import { Edge, Node, Transition } from '$lib/automata-models';
import { withReactivity } from '../helpers.svelte';

// --- Helpers

function makeNodes() {
	const q0 = new Node({ x: 0, y: 0 }, 'q0');
	const q1 = new Node({ x: 100, y: 0 }, 'q1');
	return { q0, q1 };
}

function makeEdge() {
	const { q0, q1 } = makeNodes();
	return { edge: new Edge(q0, q1), q0, q1 };
}

// --- Transitions

// Note: When adding a new edge via FSAGraph.createNewEdge, it automatically adds a default empty transition. This is not the case for simply using the Edge constructor (which creates an edge with no transitions).
describe('Edge - transitions', () => {
	it('a new edge has no transitions by default', () => {
		withReactivity(() => {
			const { edge } = makeEdge();
			expect(edge.transitions).toHaveLength(0);
		});
	});

	it('transitions are correctly added', () => {
		withReactivity(() => {
			const { edge } = makeEdge();
			edge.addTransitions(new Transition('a', null, null, 't0'));
			expect(edge.transitions).toHaveLength(1);
		});
	});

	it('error thrown when adding transition with duplicate id', () => {
		withReactivity(() => {
			const { edge } = makeEdge();
			edge.addTransitions(new Transition('a', null, null, 't0'));
			expect(() => edge.addTransitions(new Transition('b', null, null, 't0'))).toThrow();
		});
	});

	it('transitions are correctly removed', () => {
		withReactivity(() => {
			const { edge } = makeEdge();
			edge.addTransitions(new Transition('a', null, null, 't0'));
			edge.deleteTransitions('t0');
			expect(edge.transitions).toHaveLength(0);
		});
	});
});

// --- Loopback

describe('Edge - loopback', () => {
	it('isLoopback is true when source and target are the same node', () => {
		withReactivity(() => {
			const { q0 } = makeNodes();
			const loop = new Edge(q0, q0);
			expect(loop.isLoopback).toBe(true);
		});
	});

	it('isLoopback is false when source and target are different nodes', () => {
		withReactivity(() => {
			const { edge } = makeEdge();
			expect(edge.isLoopback).toBe(false);
		});
	});
});

// --- Serialization

describe('Edge - serialization', () => {
	it('save/restore preserves transitions, control point offset, and isSymmetric', () => {
		withReactivity(() => {
			const { edge, q0, q1 } = makeEdge();
			edge.addTransitions(new Transition('a', null, null, 't0'));
			edge.updateControlPoint({ x: 60, y: 80 });
			edge.isSymmetric = true;
			const nodesMap = new Map([
				[q0.id, q0],
				[q1.id, q1]
			]);
			const restored = Edge.fromJSON(edge.toJSON(), nodesMap);
			expect(restored.transitions).toHaveLength(1);
			expect(restored.transitions[0].consume).toBe('a');
			expect(restored.hasDefaultControlPoint).toBe(false);
			expect(restored.isSymmetric).toBe(true);
		});
	});

	it('fromJSON throws when source node is missing', () => {
		withReactivity(() => {
			const { edge, q1 } = makeEdge();
			const nodesMap = new Map([[q1.id, q1]]); // q0 missing
			expect(() => Edge.fromJSON(edge.toJSON(), nodesMap)).toThrow();
		});
	});

	it('fromJSON throws when target node is missing', () => {
		withReactivity(() => {
			const { edge, q0 } = makeEdge();
			const nodesMap = new Map([[q0.id, q0]]); // q1 missing
			expect(() => Edge.fromJSON(edge.toJSON(), nodesMap)).toThrow();
		});
	});
});
