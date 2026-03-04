import type { ComputationNode } from '$lib/automata/analisys';
import { Transition } from '$lib/automata/models';

export interface PathAnimationControls {
	play: () => void;
	pause: () => void;
	scrubTo: (ms: number) => void;
	totalDuration: number;
}

export interface SimulationSettings {
	speed: number;
}

const DEFAULT_SETTINGS: SimulationSettings = { speed: 1 };

export class SimulationController {
	readonly nodePath: ComputationNode[];
	readonly input: string[];
	readonly isAccepting: boolean;
	private _animControls = $state<PathAnimationControls | null>(null);
	private _isPlaying = $state(false);
	private _currentTime = $state(0);
	private _rafId: number | null = null;
	private _playStartTime: number | null = null;
	private _playStartCurrentTime: number = 0;

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
		return this._animControls?.totalDuration ?? 0;
	}

	get canPlay() {
		return this._animControls !== null && this._currentTime < this.totalDuration;
	}

	registerAnimationControls(controls: PathAnimationControls) {
		this._animControls = controls;
	}

	play(): void {
		if (this._isPlaying || !this._animControls) return;
		this._isPlaying = true;
		this._animControls.play();

		this._playStartTime = performance.now();
		this._playStartCurrentTime = this._currentTime;

		const tick = (now: number) => {
			const elapsed = (now - this._playStartTime!) * this.settings.speed;
			this._currentTime = Math.min(this._playStartCurrentTime + elapsed, this.totalDuration);
			if (this._currentTime >= this.totalDuration) {
				this._isPlaying = false;
				this._rafId = null;
				return;
			}
			this._rafId = requestAnimationFrame(tick);
		};
		this._rafId = requestAnimationFrame(tick);
	}

	pause(): void {
		if (!this._isPlaying) return;
		this._isPlaying = false;
		this._animControls?.pause();
		if (this._rafId !== null) {
			cancelAnimationFrame(this._rafId);
			this._rafId = null;
		}
	}

	scrubTo(ms: number): void {
		this._currentTime = Math.max(0, Math.min(ms, this.totalDuration));
		this._animControls?.scrubTo(this._currentTime);
	}

	resetSettings(): void {
		this.settings = { ...DEFAULT_SETTINGS };
	}

	destroy(): void {
		this.pause();
		this._animControls = null;
	}
}
