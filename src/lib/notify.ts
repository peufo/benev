import { toast } from 'svelte-sonner'

export function useNotify() {
	return {
		simple: toast.info,
		success: toast.success,
		warning: toast.warning,
		error: toast.error,
	}
}
