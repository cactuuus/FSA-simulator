import type { ComputationTree, ComputationNode } from '$lib/automata/analisys';

export type StepType = 'start' | 'consume-symbol' | 'epsilon-closure' | 'result';

export interface SimulationSubStep {
	activeNodes: ComputationNode[];
	activeTransitionsIds: string[];
	invalidNodes?: ComputationNode[];
	acceptingNodes?: ComputationNode[];
}

export interface SimulationStep {
	inputIndex: number;
	type: StepType;
	subSteps: SimulationSubStep[];
}

export interface SimulationSettings {
	speed: number;
}

const DEFAULT_SETTINGS: SimulationSettings = { speed: 1 };

export class SimulationController {
	private _tree: ComputationTree;
	private _steps: SimulationStep[];
	private _stepIndex = $state(0);
	private _subStepIndex = $state(0);
	private _isPlaying = $state(false);
	private _intervalId: ReturnType<typeof setInterval> | null = null;
	settings = $state<SimulationSettings>({ ...DEFAULT_SETTINGS });

	constructor(tree: ComputationTree) {
		this._tree = tree;
		this._steps = this.buildSteps();
	}

	get stepIndex() {
		return this._stepIndex;
	}

	get subStepIndex() {
		return this._subStepIndex;
	}

	get isPlaying() {
		return this._isPlaying;
	}

	get input() {
		return this._tree.input;
	}

	get steps() {
		return this._steps;
	}

	get currentStep(): SimulationStep {
		return this._steps[this._stepIndex];
	}

	get currentSubStep(): SimulationSubStep {
		return this.currentStep.subSteps[this._subStepIndex];
	}

	get activeNodes(): ComputationNode[] {
		return this.currentSubStep?.activeNodes ?? [];
	}

	get activeTransitionsIds(): string[] {
		return this.currentSubStep?.activeTransitionsIds ?? [];
	}

	get canGoNext(): boolean {
		const hasNextSubStep = this._subStepIndex < this.currentStep.subSteps.length - 1;
		const hasNextStep = this._stepIndex < this._steps.length - 1;
		return hasNextSubStep || hasNextStep;
	}

	get canGoPrevious(): boolean {
		return this._stepIndex > 0 || this._subStepIndex > 0;
	}

	get currentStepLabel(): string {
		const step = this.currentStep;
		switch (step.type) {
			case 'start':
				return 'Start';
			case 'consume-symbol':
				return `Processing symbol '${this.input[step.inputIndex]}'`;
			case 'epsilon-closure':
				return 'Computing ε-closure';
			case 'result':
				return 'Result';
			default:
				return step.type;
		}
	}

	getActiveNodesForState(stateId: string): ComputationNode[] {
		return this.activeNodes.filter((n) => n.config.state.id === stateId);
	}

	next(): void {
		if (!this.canGoNext) return;
		if (this._subStepIndex < this.currentStep.subSteps.length - 1) {
			this._subStepIndex++;
		} else {
			this._stepIndex++;
			this._subStepIndex = 0;
		}
	}

	previous(): void {
		if (!this.canGoPrevious) return;
		if (this._subStepIndex > 0) {
			this._subStepIndex--;
		} else {
			this._stepIndex--;
			this._subStepIndex = this.currentStep.subSteps.length - 1;
		}
	}

	play(): void {
		if (this._isPlaying) return;
		this._isPlaying = true;
		this._intervalId = setInterval(() => {
			if (this.canGoNext) {
				this.next();
			} else {
				this.pause();
			}
		}, 1000 / this.settings.speed);
	}

	pause(): void {
		this._isPlaying = false;
		if (this._intervalId) {
			clearInterval(this._intervalId);
			this._intervalId = null;
		}
	}

	resetSettings(): void {
		this.settings = { ...DEFAULT_SETTINGS };
	}

	private buildSteps(): SimulationStep[] {
		const steps: SimulationStep[] = [];
		const root = this._tree.root;
		let inputIndex = root.config.group;

		// NOTE TO SELF: this is way to convoluted. It mighe be a better idea to just keep substeps for epsilon-closures only, and the rest simply having lists of active nodes, transitions, node to prune, etc. potentially having interfaces for each step type, as they are quite different. then, in the UI component we can handle each step type differently.

		// start step
		const startStep: SimulationStep = { inputIndex: -1, type: 'start', subSteps: [] };
		startStep.subSteps.push({ activeNodes: [], activeTransitionsIds: [] });
		startStep.subSteps.push({ activeNodes: [root], activeTransitionsIds: ['start-edge'] });
		startStep.subSteps.push({ activeNodes: [root], activeTransitionsIds: [] });
		steps.push(startStep);

		// epsilon closure from root
		const startWaves = this.collectEpsilonWaves([root]);
		if (startWaves.length > 0) {
			const epsilonStartStep: SimulationStep = {
				inputIndex: inputIndex,
				type: 'epsilon-closure',
				subSteps: []
			};
			epsilonStartStep.subSteps.push(...this.buildEpsilonSubSteps([root], startWaves));
			steps.push(epsilonStartStep);
		}

		let active = [root, ...startWaves.flat()];

		while (active.length > 0 && inputIndex < this._tree.input.length - 1) {
			inputIndex++;
			const reached = active.flatMap((n) =>
				n.children.filter((c) => c.config.group === inputIndex)
			);
			const pruned = active.filter((n) => !n.children.some((c) => c.config.group === inputIndex));
			const validNodes = active.filter((n) => !pruned.includes(n));
			const transitions = reached.map((n) => n.transitionTaken!);

			const consumeStep: SimulationStep = { inputIndex, type: 'consume-symbol', subSteps: [] };

			if (reached.length === 0) {
				// this means none of the active nodes can consume the current symbol
				consumeStep.subSteps.push({
					activeNodes: [],
					activeTransitionsIds: [],
					invalidNodes: [...active]
				});
				steps.push(consumeStep);
				active = [];
				break; // end simulation early
			}
			if (pruned.length > 0) {
				// sub-step 1: highlight pruned nodes as invalid, if any
				consumeStep.subSteps.push({
					activeNodes: [...validNodes],
					activeTransitionsIds: [],
					invalidNodes: [...pruned]
				});

				// sub-step 2: show only remaining active nodes
				consumeStep.subSteps.push({
					activeNodes: [...validNodes],
					activeTransitionsIds: []
				});
			}
			// sub-step 3: show valid transitions
			consumeStep.subSteps.push({
				activeNodes: [...validNodes, ...reached],
				activeTransitionsIds: transitions.map((t) => t.id)
			});
			// sub-step 4: settle on reached nodes only
			consumeStep.subSteps.push({
				activeNodes: [...reached],
				activeTransitionsIds: []
			});
			steps.push(consumeStep);

			// epsilon closure step
			const waves = this.collectEpsilonWaves(reached);
			if (waves.length > 0) {
				const epsilonStep: SimulationStep = { inputIndex, type: 'epsilon-closure', subSteps: [] };
				epsilonStep.subSteps.push(...this.buildEpsilonSubSteps(reached, waves));
				steps.push(epsilonStep);
			}
			reached.push(...waves.flat());
			active = reached;
		}

		const reachedEndOfInput = inputIndex === this._tree.input.length - 1;
		if (reachedEndOfInput) inputIndex++;

		const resultStep: SimulationStep = {
			inputIndex: inputIndex,
			type: 'result',
			subSteps: []
		};

		if (!reachedEndOfInput) {
			// this means we ended the simulation early because no active nodes could consume the current symbol.
			// we just show nothing as active.
			resultStep.subSteps.push({
				activeNodes: [],
				activeTransitionsIds: []
			});
			steps.push(resultStep);
		} else {
			const acceptingNodes = active.filter(
				(n) => n.config.state.isAccepting && n.config.stack.length === 0
			);
			const failingNodes = active.filter((n) => !acceptingNodes.includes(n));
			// highlight pruned and accepting nodes
			resultStep.subSteps.push({
				activeNodes: [],
				activeTransitionsIds: [],
				invalidNodes: [...failingNodes],
				acceptingNodes: [...acceptingNodes]
			});
			steps.push(resultStep);
		}

		return steps;
	}

	private collectEpsilonWaves(roots: ComputationNode[]): ComputationNode[][] {
		const waves: ComputationNode[][] = [];
		let frontier = roots;

		while (frontier.length > 0) {
			const next = frontier.flatMap((n) =>
				n.children.filter((c) => c.config.group === n.config.group)
			);
			if (next.length === 0) break;
			waves.push(next);
			frontier = next;
		}

		return waves;
	}

	private buildEpsilonSubSteps(
		roots: ComputationNode[],
		waves: ComputationNode[][]
	): SimulationSubStep[] {
		const subSteps: SimulationSubStep[] = [];
		let cumulativeNodes = [...roots];

		for (const wave of waves) {
			const waveTransitions = wave.map((n) => n.transitionTaken!);
			cumulativeNodes = [...cumulativeNodes, ...wave];

			// show transitions firing
			subSteps.push({
				activeNodes: cumulativeNodes,
				activeTransitionsIds: waveTransitions.map((t) => t.id)
			});

			// show new nodes added, clean up transitions
			subSteps.push({
				activeNodes: cumulativeNodes,
				activeTransitionsIds: []
			});
		}

		return subSteps;
	}
}
