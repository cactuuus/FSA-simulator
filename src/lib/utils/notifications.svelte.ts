export interface NotificationEvent {
	type: NotificationType;
	message: string;
}

export interface Notification {
	id: string;
	type: NotificationType;
	message: string;
}

export enum NotificationType {
	Info = 'Info',
	Success = 'Success',
	Error = 'Error',
	Warning = 'Warning'
}

export const MESSAGE_DURATION = 3000;
export const notificationQueue = $state<Notification[]>([]);

export function removeNotification(id: string): void {
	const index = notificationQueue.findIndex((notification) => notification.id === id);
	if (index !== -1) {
		notificationQueue.splice(index, 1);
	}
}

export function addNotification(type: NotificationType, message: string): void {
	const id = crypto.randomUUID();
	notificationQueue.push({ id, type, message });
	setTimeout(() => {
		removeNotification(id);
	}, MESSAGE_DURATION);
}
