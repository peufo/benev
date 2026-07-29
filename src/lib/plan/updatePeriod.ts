import { toast } from 'svelte-sonner'
import { movePeriod } from '$lib/period/period.remote'

export async function updatePeriod(period: { id: string; start: Date; end: Date; teamId: string }) {
	try {
		await movePeriod(period)
		toast.success('Période mise à jour')
	} catch (err) {
		toast.error('Erreur')
		console.error(err)
	}
}
