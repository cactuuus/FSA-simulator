import { describe, it, expect } from 'vitest';
import { Node } from '$lib/automata-models';
import { withReactivity } from '../helpers.svelte';

// --- Serialization

describe('Node - serialization', () => {
	it('save/restore preserves id, position, label, and accepting state', () => {
		withReactivity(() => {
			const point = { x: 33, y: 77 };
			const node = new Node({ x: point.x, y: point.y }, 'q0', true, 'test-id');
			const restored = Node.fromJSON(node.toJSON());
			expect(restored.id).toBe('test-id');
			expect(restored.pos).toEqual({ x: point.x, y: point.y });
			expect(restored.label).toBe('q0');
			expect(restored.isAccepting).toBe(true);
		});
	});

	it('fromJSON throws on missing id', () => {
		withReactivity(() => {
			expect(() =>
				Node.fromJSON({ id: '', pos: { x: 0, y: 0 }, label: 'q0', isAccepting: false })
			).toThrow();
		});
	});

	it('fromJSON throws on invalid position', () => {
		withReactivity(() => {
			expect(() =>
				Node.fromJSON({ id: 'test-id', pos: { x: NaN, y: 0 }, label: 'q0', isAccepting: false })
			).toThrow();
		});
	});
});
