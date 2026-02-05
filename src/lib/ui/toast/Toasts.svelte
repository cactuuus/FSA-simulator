<script lang="ts">
	import { onMount } from 'svelte';
	import {
		X,
		CircleCheck,
		CircleX,
		Info,
		CircleAlert,
		type Icon as IconType
	} from '@lucide/svelte';
	import { type NotificationEvent, NotificationType } from '$lib/utils/notifications';

	interface Notification extends NotificationEvent {
		id: string;
	}

	interface ToastConfig {
		icon: typeof IconType;
		textClass: string;
		bgClass: string;
	}

	const MESSAGE_DURATION = 5000; // duration in milliseconds
	const queue = $state<Notification[]>([]);

	// maps each notification type to its corresponding toast configuration
	// it includes some classes for styling, since doing it dynamically (aka class="text-{color}")
	// is not properly recognised by postCSS, resulting in missing styles.
	const toastConfigMap: Record<NotificationType, ToastConfig> = {
		[NotificationType.Success]: {
			icon: CircleCheck,
			textClass: 'text-success',
			bgClass: 'bg-success'
		},
		[NotificationType.Error]: {
			icon: CircleX,
			textClass: 'text-error',
			bgClass: 'bg-error'
		},
		[NotificationType.Info]: {
			icon: Info,
			textClass: 'text-info',
			bgClass: 'bg-info'
		},
		[NotificationType.Warning]: {
			icon: CircleAlert,
			textClass: 'text-warning',
			bgClass: 'bg-warning'
		}
	};

	function removeNotification(id: string): void {
		const index = queue.findIndex((notification) => notification.id === id);
		if (index !== -1) {
			queue.splice(index, 1);
		}
	}

	function addNotification(type: NotificationType, message: string): void {
		const id = crypto.randomUUID();
		queue.unshift({ id, type, message });
		setTimeout(() => {
			removeNotification(id);
		}, MESSAGE_DURATION);
	}

	onMount(() => {
		const handleNotifyEvent = (event: CustomEvent<NotificationEvent>) => {
			addNotification(event.detail.type, event.detail.message);
		};
		window.addEventListener('notify', handleNotifyEvent as EventListener);
		return () => {
			window.removeEventListener('notify', handleNotifyEvent as EventListener);
		};
	});
</script>

<div class="absolute bottom-2 left-1/2 stack w-sm max-w-11/12 -translate-x-1/2">
	{#each queue as notification (notification.id)}
		{@const config = toastConfigMap[notification.type]}
		<div role="alert" class="relative alert overflow-hidden bg-base-100/90 alert-soft shadow">
			<div class="flex flex-col gap-1">
				<h3 class="font-bold {config.textClass} flex items-center gap-2">
					<config.icon class="h-4 w-4" />
					{notification.type}
				</h3>
				<div class="ml-1 text-sm">{notification.message}</div>
			</div>
			<button
				class="btn absolute top-2 right-2 btn-square self-start btn-ghost btn-xs"
				onclick={() => removeNotification(notification.id)}
			>
				<X class="h-4 w-4" />
			</button>

			<!-- progress bar showing time left until auto-closing -->
			<div class="absolute bottom-0 left-0 h-1 w-full bg-transparent">
				<div
					class="h-full w-full {config.bgClass}"
					style="animation: expand {MESSAGE_DURATION}ms linear"
				></div>
			</div>
		</div>
	{/each}
</div>
