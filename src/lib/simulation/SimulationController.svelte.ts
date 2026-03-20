import { type Timeline } from 'animejs';
import { FSAGraph } from '$lib/automata-models';
import { ComputationTree, type FullPath, type PathLeaf } from './computationTree';

export interface SimulationSettings {
	speed: number;
}

const DEFAULT_SETTINGS: SimulationSettings = { speed: 1 };

export class SimulationController {
	// Computation state
	private _input = $state<string[]>([]);
	private _tree = $state<ComputationTree | null>(null);
	private _fsaSnapshotWhenComputed = $state<string | null>(null);

	get input() {
		return this._input;
	}
	get tree() {
		return this._tree;
	}
	get pathsLeaves(): PathLeaf[] {
		return this._tree?.pathsLeaves ?? [];
	}
	get warnings(): string[] {
		return this._tree?.warnings.map((w) => w.message) ?? [];
	}

	// Simulation state
	private _active = $state(false);
	private _selectedPath = $state<FullPath | null>(null);

	get isSimulating() {
		return this._active;
	}
	get selectedPath() {
		return this._selectedPath;
	}

	// Playback state
	private _timeline = $state<Timeline | null>(null);
	private _isPlaying = $state(false);
	currentTime = $state(0);
	currentGroup = $state<number | null>(null);
	settings = $state<SimulationSettings>({ ...DEFAULT_SETTINGS });

	get totalDuration() {
		return this._timeline?.duration ?? 0;
	}
	get isPlaying() {
		return this._isPlaying;
	}
	get canPlay() {
		return this._timeline !== null && this.currentTime < this.totalDuration;
	}
	get canStop() {
		return this._timeline !== null && (this._isPlaying || this.currentTime > 0);
	}

	// Computation methods

	fsaHasChangedSince(fsa: FSAGraph): boolean {
		if (!this._fsaSnapshotWhenComputed) return true;
		return JSON.stringify(fsa.toJSON()) !== this._fsaSnapshotWhenComputed;
	}

	computeInput(fsa: FSAGraph, input: string[], maxLoopIterations: number = 0): void {
		this._input = input;
		this._tree = new ComputationTree(fsa, input, maxLoopIterations);
		this._fsaSnapshotWhenComputed = JSON.stringify(fsa.toJSON());
		this._selectedPath = null;
	}

	// Simulation methods

	startSimulation(leaf: PathLeaf): void {
		if (!this._tree) return;
		this.stop();
		this._timeline = null;
		this._selectedPath = this._tree.getFullPath(leaf);
		this._active = true;
	}

	endSimulation(): void {
		this.stop();
		this._selectedPath = null;
		this._timeline = null;
		this._active = false;
	}

	// Playback methods

	registerTimeline(tl: Timeline): void {
		this._timeline = tl;
	}

	play(): void {
		if (this._isPlaying || !this._timeline) return;
		this._isPlaying = true;
		this._timeline.play();
	}

	pause(): void {
		if (!this._isPlaying || !this._timeline) return;
		this._isPlaying = false;
		this._timeline.pause();
	}

	stop(): void {
		if (!this._timeline) return;
		this._isPlaying = false;
		this._timeline.cancel();
		this._timeline.seek(0);
		this.currentTime = 0;
		this.currentGroup = null;
	}

	scrubTo(ms: number): void {
		if (!this._timeline) return;
		this.currentTime = Math.max(0, Math.min(ms, this.totalDuration));
		this._timeline.seek(this.currentTime);
	}

	setSpeed(speed: number): void {
		this.settings.speed = speed;
		if (this._timeline) this._timeline.speed = speed;
	}

	resetSettings(): void {
		this.settings = { ...DEFAULT_SETTINGS };
		if (this._timeline) this._timeline.speed = DEFAULT_SETTINGS.speed;
	}

	onPlaybackEnded(): void {
		this._isPlaying = false;
	}

	setCurrentTime(ms: number): void {
		this.currentTime = ms;
	}
	setCurrentGroup(groupNo: number | null): void {
		this.currentGroup = groupNo;
	}

	// General

	reset(): void {
		this.endSimulation();
		this._input = [];
		this._tree = null;
		this._fsaSnapshotWhenComputed = null;
	}
}
