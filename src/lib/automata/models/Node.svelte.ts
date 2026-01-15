import type { Point } from '$lib/geometry';
import type { FSAItem } from '$lib/automata/models/types';
import type { SerializedNode, Serializable } from '$lib/automata/serialisation';
import { UserFacingError } from '$lib/utils';

/**
 * Represents a state in the finite state automaton (FSA). Each node has a position, label,
 * and acceptance status. Whether a node is starting or not is managed by the FSAGraph class.
 */
export class Node implements FSAItem, Serializable<SerializedNode> {
	static readonly RADIUS = 30;

	readonly id: string;
	private _pos = $state<Point>({ x: 0, y: 0 });
	label = $state<string>('');
	isAccepting = $state<boolean>(false);

	constructor(pos: Point, label: string = '', isAccepting: boolean = false, id?: string) {
		this.id = id ?? crypto.randomUUID();
		this._pos = pos;
		this.label = label;
		this.isAccepting = isAccepting;
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

	// about pos: I cannot figure out why but in this instance ( and other similar cases) pos is not serializing correctly unless manually unpacked. In Edge for example, the serializing the point controlOffset works fine. I think it might have something to do with controlOffset being nullable? So possibly some edge case in Svelte's reactivity system.
	toJSON(): SerializedNode {
		return {
			id: this.id,
			pos: { x: this.pos.x, y: this.pos.y },
			label: this.label,
			isAccepting: this.isAccepting
		};
	}

	static fromJSON(json: SerializedNode): Node {
		if (!json.id) {
			throw new UserFacingError(`Missing ID in serialized node`);
		}
		if (!json.pos || typeof json.pos.x !== 'number' || typeof json.pos.y !== 'number') {
			throw new UserFacingError(
				`Invalid position data in serialized node: { x: ${json.pos?.x}, y: ${json.pos?.y}}`
			);
		}
		return new Node(json.pos, json.label, json.isAccepting, json.id);
	}
}
