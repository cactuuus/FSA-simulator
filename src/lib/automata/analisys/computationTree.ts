import { FSAGraph, Node, Transition } from '../models';

export interface Configuration {
	state: Node;
	stack: string[]; // empty for non PDAs
	group: number;
}

export class ComputationNode {
	config: Configuration;
	parent: ComputationNode | null;
	transitionTaken: Transition | null;
	children: ComputationNode[];

	constructor(
		{ state, stack, group }: Configuration,
		parent: ComputationNode | null = null,
		transitionTaken: Transition | null = null
	) {
		this.config = { state, stack, group };
		this.parent = parent;
		this.transitionTaken = transitionTaken;
		this.children = [];
	}

	addChild(config: Configuration, viaTransition: Transition): ComputationNode {
		const newNode = new ComputationNode(config, this, viaTransition);
		this.children.push(newNode);
		return newNode;
	}

	toString(indent: string = '', isLast: boolean = true): string {
		const prefix = indent + (isLast ? '└─ ' : '├─ ');
		const stackStr = `[${this.config.stack.join(',')}]`;
		const transitionStr = this.transitionTaken ? ` via '${this.transitionTaken.toString()}'` : '';
		let result = `${prefix}${this.config.state.label}${stackStr} (g${this.config.group})${transitionStr}\n`;
		const childIndent = indent + (isLast ? ' ' : '│ ');
		this.children.forEach((child, index) => {
			const isLastChild = index === this.children.length - 1;
			result += child.toString(childIndent, isLastChild);
		});
		return result;
	}
}

export class ComputationTree {
	readonly root: ComputationNode;
	readonly input: string[];
	readonly maxVisits: number;
	private fsa: FSAGraph;
	private inputIndex: number = -1;
	warnings: string[] = [];

	constructor(fsa: FSAGraph, input: string[], maxVisits: number = 0) {
		this.fsa = fsa;
		this.input = input;
		this.maxVisits = maxVisits;
		if (this.fsa.startNode === null) {
			throw new Error('FSA is missing start node, cannot compute input.');
		}

		this.root = new ComputationNode({
			state: this.fsa.startNode,
			stack: [],
			group: this.inputIndex
		});
		this.computeEpsilonClosure(
			this.root,
			new Map([[this.root.config.state.id, new Set([this.encodeStack(this.root.config.stack)])]])
		);

		this.input.forEach((symbol) => {
			// Process next input symbol
			let activeNodes = this.getNodesInGroup(this.inputIndex);
			this.inputIndex++;
			activeNodes.forEach((node) => this.computeSymbol(node, symbol));

			// process epsilon closure
			activeNodes = this.getNodesInGroup(this.inputIndex);
			activeNodes.forEach((node) => {
				this.computeEpsilonClosure(
					node,
					new Map([[node.config.state.id, new Set([this.encodeStack(node.config.stack)])]])
				);
			});
		});
	}

	/**
	 * Gets all nodes in the tree belonging to a given group index.
	 */
	getNodesInGroup(groupIndex: number): ComputationNode[] {
		const result: ComputationNode[] = [];
		const visit = (node: ComputationNode) => {
			if (node.config.group === groupIndex) result.push(node);
			node.children.forEach(visit);
		};
		visit(this.root);
		return result;
	}

	get acceptingPaths(): ComputationNode[][] {
		return this.getNodesInGroup(this.input.length - 1)
			.filter((n) => n.config.state.isAccepting && n.config.stack.length === 0)
			.map((leaf) => this.getPathFromRoot(leaf));
	}

	getPathFromRoot(node: ComputationNode): ComputationNode[] {
		const path: ComputationNode[] = [];
		let current: ComputationNode | null = node;
		while (current) {
			path.unshift(current);
			current = current.parent;
		}
		return path;
	}

	private computeSymbol(node: ComputationNode, symbol: string): void {
		const validTransitions = this.getValidTransitions(
			node.config.state,
			symbol,
			node.config.stack.at(-1)
		);
		validTransitions.forEach(([transition, targetState]) => {
			const adjustedStack = [...node.config.stack];
			if (this.fsa.hasStackOps) {
				if (transition.pop !== Transition.EPSILON) adjustedStack.pop();
				if (transition.push !== Transition.EPSILON) adjustedStack.push(transition.push!);
			}
			node.addChild(
				{ state: targetState, stack: adjustedStack, group: this.inputIndex },
				transition
			);
		});
	}

	private computeEpsilonClosure(
		node: ComputationNode,
		seenConfigs: Map<string, Set<string>> = new Map()
	): void {
		const validTransitions = this.getValidTransitions(
			node.config.state,
			Transition.EPSILON,
			node.config.stack.at(-1)
		);

		for (const [transition, targetState] of validTransitions) {
			const adjustedStack = [...node.config.stack];
			if (this.fsa.hasStackOps) {
				if (transition.pop !== Transition.EPSILON) adjustedStack.pop();
				if (transition.push !== Transition.EPSILON) adjustedStack.push(transition.push!);
			}
			const config = { state: targetState, stack: adjustedStack, group: this.inputIndex };
			const previouslySeenStacks = seenConfigs.get(config.state.id) ?? new Set<string>();
			const currentStack = this.encodeStack(config.stack);

			// no need to re-visit a configuration we've already
			if (previouslySeenStacks.has(currentStack)) continue;

			// here we use prefixes to check if we're in a loop were the stack is simply growing indefinitely. The logic is: if we already arrived at this state, and we have a number X of previously seen stacks that are prefixes of the current stack, then it means we're in iteration X of an infinite loop. If X is bigger than the maxVisits threshold, we stop exploring this branch and add a warning to the tree.
			const prefixCount = [...previouslySeenStacks].reduce((count, seenStack) => {
				return count + (currentStack.startsWith(seenStack) ? 1 : 0);
			}, 0);
			if (prefixCount > this.maxVisits) {
				this.warnings.push(
					`Possible infinite epsilon loop involving state '${node.config.state.label}' and transition '${transition.toString()}'. Halted exploration of this branch after ${this.maxVisits} loops through it.`
				);
				continue;
			}

			seenConfigs.set(config.state.id, previouslySeenStacks.add(currentStack));
			const newNode = node.addChild(config, transition);
			this.computeEpsilonClosure(newNode, seenConfigs);
			seenConfigs.get(config.state.id)?.delete(currentStack);
		}
	}

	private getValidTransitions(
		state: Node,
		consume: string,
		stackTop?: string
	): [Transition, Node][] {
		const transitions = this.fsa.adjacencyMap.get(state) ?? [];
		let valid = transitions.filter(([t]) => t.consume === consume);
		if (stackTop !== undefined) {
			valid = valid.filter(([t]) => t.pop === Transition.EPSILON || t.pop === stackTop);
		}
		return valid;
	}

	private encodeStack(stack: string[]): string {
		return stack.length > 0 ? `${stack.join(',')},` : '';
	}

	toString(): string {
		let result = `Computation tree for input: '${this.input.join(',')}'\n`;
		if (this.warnings.length > 0) {
			result += 'Warnings:\n';
			this.warnings.forEach((w) => (result += `- ${w}\n`));
		}
		result += `Accepting paths: ${this.acceptingPaths.length}\n`;
		this.acceptingPaths.forEach((path, i) => {
			result += `Path ${i + 1}: ${path.map((n) => n.config.state.label).join(' -> ')}\n`;
		});
		result += 'Tree:\n';
		result += this.root.toString();
		return result;
	}
}
