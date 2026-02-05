import type { Point } from '$lib/utils/geometry';
import type { Serializable } from '$lib/utils/serialization';
import type { FSAItem } from './types';

/**
 * Serialized representation of a Node.
 */
export interface SerializedNode {
	id: string;
	pos: Point;
	label: string;
	isAccepting: boolean;
}

/**
 * Represents a state in the finite state automaton (FSA). Each node has a position, label,
 * and acceptance status. Whether a node is starting or not is managed by the FSAGraph class.
 */
export class Node implements FSAItem, Serializable<SerializedNode> {
	readonly id: string;
	private _pos = $state<Point>({ x: 0, y: 0 });
	label = $state<string>('');
	isAccepting = $state<boolean>(false);

	constructor(pos: Point, label: string = '', isAccepting: boolean = false, id?: string) {
		this.id = id ?? Node.createId();
		this._pos = pos;
		this.label = label;
		this.isAccepting = isAccepting;
	}

	static createId(): string {
		return crypto.randomUUID();
	}

	get pos(): Point {
		return this._pos;
	}

	/**
	 * Move the node by a given offset.
	 * @param delta The change in position, given as a x and y offset.
	 */
	moveBy(delta: Point): void {
		this._pos = { x: this._pos.x + delta.x, y: this._pos.y + delta.y };
	}

	/**
	 * Move the node to a new position.
	 * @param newPos The new position of the node.
	 */
	moveTo(newPos: Point): void {
		this._pos = newPos;
	}

	/**
	 * Toggle the accepting status of the node.
	 */
	toggleAccepting(): void {
		this.isAccepting = !this.isAccepting;
	}

	toJSON(): SerializedNode {
		return {
			id: this.id,
			pos: this.pos,
			label: this.label,
			isAccepting: this.isAccepting
		};
	}

	static fromJSON(json: SerializedNode): Node {
		if (!json.id) {
			throw new Error(`Missing ID in serialized node`);
		}
		if (!json.pos || typeof json.pos.x !== 'number' || typeof json.pos.y !== 'number') {
			throw new Error(
				`Invalid position data in serialized node: { x: ${json.pos?.x}, y: ${json.pos?.y}}`
			);
		}
		return new Node(json.pos, json.label, json.isAccepting, json.id);
	}
}
