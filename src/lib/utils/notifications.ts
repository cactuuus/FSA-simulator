/**
 * Representation of a notification event.
 */
export interface NotificationEvent {
	type: NotificationType;
	message: string;
}

/**
 * Types of notifications that can be sent.
 */
export enum NotificationType {
	Info = 'Info',
	Success = 'Success',
	Error = 'Error',
	Warning = 'Warning'
}

/**
 * Notifies the user with an error message.
 * @param message The error message to display.
 */
export function notifyError(message: string): void {
	window.dispatchEvent(
		new CustomEvent('notify', {
			detail: { type: NotificationType.Error, message }
		})
	);
}

/**
 * Notifies the user with a success message.
 * @param message The success message to display.
 */
export function notifySuccess(message: string): void {
	window.dispatchEvent(
		new CustomEvent('notify', {
			detail: { type: NotificationType.Success, message }
		})
	);
}

/**
 * Notifies the user with an info message.
 * @param message The informational message to display.
 */
export function notifyInfo(message: string): void {
	window.dispatchEvent(
		new CustomEvent('notify', {
			detail: { type: NotificationType.Info, message }
		})
	);
}

/**
 * Notifies the user with a warning message.
 * @param message The warning message to display.
 */
export function notifyWarning(message: string): void {
	window.dispatchEvent(
		new CustomEvent('notify', {
			detail: { type: NotificationType.Warning, message }
		})
	);
}
