import { UserFacingError } from '$lib/utils';

export interface NotificationEvent {
	type: NotificationType;
	message: string;
}

export enum NotificationType {
	Info = 'Info',
	Success = 'Success',
	Error = 'Error',
	Warning = 'Warning'
}

function logError(error: unknown): void {
	window.dispatchEvent(
		new CustomEvent('notify', {
			detail: {
				type: NotificationType.Error,
				message: 'An unexpected error occurred, see console for details.'
			}
		})
	);
	console.error(error);
}

export function notifyError(error: unknown): void {
	if (error instanceof UserFacingError) {
		window.dispatchEvent(
			new CustomEvent('notify', {
				detail: { type: NotificationType.Error, message: error.message }
			})
		);
	} else {
		logError(error);
	}
}

export function notifySuccess(message: string): void {
	window.dispatchEvent(
		new CustomEvent('notify', {
			detail: { type: NotificationType.Success, message }
		})
	);
}

export function notifyInfo(message: string): void {
	window.dispatchEvent(
		new CustomEvent('notify', {
			detail: { type: NotificationType.Info, message }
		})
	);
}

export function notifyWarning(message: string): void {
	window.dispatchEvent(
		new CustomEvent('notify', {
			detail: { type: NotificationType.Warning, message }
		})
	);
}
