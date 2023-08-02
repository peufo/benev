import { getNotificationsContext } from 'svelte-notifications'

type NotificationType = undefined | 'success' | 'warning' | 'error'
const position = 'bottom-center'
const removeAfter = 3000
const defaultOptions = { position, removeAfter }

export function useNotify() {
	const { addNotification } = getNotificationsContext()

	const notify = (type?: NotificationType) => (text: string) =>
		addNotification({
			text,
			type,
			...defaultOptions,
		})

	return {
		simple: notify(),
		success: notify('success'),
		warning: notify('warning'),
		error: notify('error'),
	}
}
