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
	private _selectedPath = $state<FullPath | null>(null);
	private _fsaSnapshotWhenComputed = $state<string | null>(null);

	// Timeline state
	private _timeline = $state<Timeline | null>(null);
	private _isPlaying = $state(false);
	private _currentTime = $state(0);
	private _currentGroup = $state<number | null>(null);
	settings = $state<SimulationSettings>({ ...DEFAULT_SETTINGS });

	get input() {
		return this._input;
	}

	get tree() {
		return this._tree;
	}

	get selectedPath() {
		return this._selectedPath;
	}

	get pathsLeaves(): PathLeaf[] {
		return this._tree?.pathsLeaves ?? [];
	}

	get warnings(): string[] {
		return this._tree?.warnings.map((w) => w.message) ?? [];
	}

	get isPlaying() {
		return this._isPlaying;
	}

	get currentTime() {
		return this._currentTime;
	}

	get totalDuration() {
		return this._timeline?.duration ?? 0;
	}

	get currentGroup() {
		return this._currentGroup;
	}

	get canPlay() {
		return this._timeline !== null && this._currentTime < this.totalDuration;
	}

	get canStop() {
		return this._timeline !== null && (this._isPlaying || this._currentTime > 0);
	}

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

	selectPath(leaf: PathLeaf): void {
		if (!this._tree) return;
		this.stop();
		this._selectedPath = this._tree.getFullPath(leaf);
		this._timeline = null;
	}

	clearSelection(): void {
		this.stop();
		this._selectedPath = null;
		this._timeline = null;
	}

	registerTimeline(tl: Timeline): void {
		this._timeline = tl;
	}

	setCurrentTime(ms: number): void {
		this._currentTime = ms;
	}

	setCurrentGroup(groupNo: number | null): void {
		this._currentGroup = groupNo;
	}

	onPlaybackEnded(): void {
		this._isPlaying = false;
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
		this._currentTime = 0;
		this._currentGroup = null;
	}

	scrubTo(ms: number): void {
		if (!this._timeline) return;
		this._currentTime = Math.max(0, Math.min(ms, this.totalDuration));
		this._timeline.seek(this._currentTime);
	}

	setSpeed(speed: number): void {
		this.settings.speed = speed;
		if (this._timeline) this._timeline.speed = speed;
	}

	resetSettings(): void {
		this.settings = { ...DEFAULT_SETTINGS };
		if (this._timeline) this._timeline.speed = DEFAULT_SETTINGS.speed;
	}

	reset(): void {
		this.stop();
		this._input = [];
		this._tree = null;
		this._fsaSnapshotWhenComputed = null;
		this._selectedPath = null;
	}
}
