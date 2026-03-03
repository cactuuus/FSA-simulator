import { FSAGraph, Node, Transition } from '../models';

export interface Configuration {
	state: Node;
	stack: string[]; // empty for non PDAs
	group: number;
}

export interface PathEnd {
	node: ComputationNode;
	isAccepting: boolean;
}

export class ComputationNode {
	config: Configuration;
	parent?: {
		node: ComputationNode;
		via: Transition;
	};
	children: ComputationNode[];

	constructor(
		{ state, stack, group }: Configuration,
		parent?: { node: ComputationNode; via: Transition }
	) {
		this.config = { state, stack, group };
		this.parent = parent;
		this.children = [];
	}

	addChild(config: Configuration, viaTransition: Transition): ComputationNode {
		const newNode = new ComputationNode(config, { node: this, via: viaTransition });
		this.children.push(newNode);
		return newNode;
	}

	isLeaf(): boolean {
		return this.children.length === 0;
	}

	hasEmptyStack(): boolean {
		return this.config.stack.length === 0;
	}

	toString(indent: string = '', isLast: boolean = true): string {
		const prefix = indent + (isLast ? '└─ ' : '├─ ');
		const stackStr = `[${this.config.stack.join(',')}]`;
		const transitionStr = this.parent ? ` via '${this.parent.via.toString()}'` : '';
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
	private groups: ComputationNode[][];
	warnings: string[] = [];

	constructor(fsa: FSAGraph, input: string[], maxVisits: number = 0) {
		this.fsa = fsa;
		this.input = input;
		this.groups = Array.from({ length: input.length + 1 }, () => []);
		this.maxVisits = maxVisits;
		if (this.fsa.startNode === null) {
			throw new Error('FSA is missing start node, cannot compute input.');
		}

		this.root = new ComputationNode({
			state: this.fsa.startNode,
			stack: [],
			group: this.inputIndex
		});
		this.addToCurrentGroup(this.root);
		this.computeEpsilonClosure(
			this.root,
			new Map([[this.root.config.state.id, new Set([this.encodeStack(this.root.config.stack)])]])
		);

		this.input.forEach((symbol) => {
			// Process next input symbol
			let activeNodes = this.getCurrentGroupNodes();
			this.inputIndex++;
			activeNodes.forEach((node) => this.computeSymbol(node, symbol));

			// process epsilon closure
			activeNodes = this.getCurrentGroupNodes();
			activeNodes.forEach((node) => {
				this.computeEpsilonClosure(
					node,
					new Map([[node.config.state.id, new Set([this.encodeStack(node.config.stack)])]])
				);
			});
		});
	}

	private addToCurrentGroup(node: ComputationNode): void {
		this.groups[this.inputIndex + 1].push(node);
	}

	private getCurrentGroupNodes(): ComputationNode[] {
		return this.groups[this.inputIndex + 1];
	}

	get allPaths(): PathEnd[] {
		const paths: PathEnd[] = [];
		this.groups.forEach((group, index) => {
			const isLastGroup = index === this.groups.length - 1;
			group.forEach((node) => {
				if (node.isLeaf() || isLastGroup) {
					const acceptsInput = isLastGroup && node.config.state.isAccepting && node.hasEmptyStack();
					paths.push({
						node: node,
						isAccepting: acceptsInput
					});
				}
			});
		});
		return paths;
	}

	getPathFromRoot(node: ComputationNode): string {
		let path = '';
		let current: ComputationNode | null = node;
		while (current) {
			path = `${current.config.state.label}${path ? ' → ' + path : ''}`;
			current = current.parent?.node ?? null;
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
			const newNode = node.addChild(
				{ state: targetState, stack: adjustedStack, group: this.inputIndex },
				transition
			);
			this.addToCurrentGroup(newNode);
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
			this.addToCurrentGroup(newNode);
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
		const acceptingPaths = this.allPaths.filter((p) => p.isAccepting);
		result += `Accepting paths: ${acceptingPaths.length}\n`;
		result += 'Tree:\n';
		result += this.root.toString();
		return result;
	}
}
