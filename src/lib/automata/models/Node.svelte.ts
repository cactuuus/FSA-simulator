import type { Point } from '$lib/geometry';
import type { FSAItem } from '$lib/automata/models';
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

	moveTo(newPos: Point): void {
		this._pos = newPos;
	}

	toggleAccepting(): void {
		this.isAccepting = !this.isAccepting;
	}

	// about pos: I cannot figure out why but in this instance pos is not serializing correctly unless unpacked
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
