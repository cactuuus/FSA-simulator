import type { ComputationNode } from '$lib/automata/analisys';
import type { Timeline } from 'animejs';
import { Transition } from '$lib/automata/models';

export interface SimulationSettings {
	speed: number;
}

const DEFAULT_SETTINGS: SimulationSettings = { speed: 1 };

export class SimulationController {
	readonly nodePath: ComputationNode[];
	readonly input: string[];
	readonly isAccepting: boolean;

	private _timeline = $state<Timeline | null>(null);
	private _isPlaying = $state(false);
	private _currentTime = $state(0);
	private _currentGroup = $state<number | null>(null);

	settings = $state<SimulationSettings>({ ...DEFAULT_SETTINGS });

	constructor(path: ComputationNode[], isAccepting: boolean) {
		this.nodePath = path;
		this.isAccepting = isAccepting;
		this.input = [];
		for (const node of path) {
			if (node.parent === undefined) continue;
			const transition = node.parent.via;
			if (transition.consume === Transition.EPSILON) continue;
			this.input.push(transition.consume);
		}
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

	get canPlay() {
		return this._timeline !== null && this._currentTime < this.totalDuration;
	}

	get currentGroup() {
		return this._currentGroup;
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
}
