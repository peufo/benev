import { toast } from 'svelte-sonner'

/** @deprecated use directly svelte-sonner instead */
export function useNotify() {
	return {
		simple: toast.info,
		success: toast.success,
		warning: toast.warning,
		error: toast.error,
	}
}
