import { get } from 'svelte/store'
import { USE_COERCE_DATE, USE_COERCE_JSON, urlParam } from 'fuma'
import { eventPath } from '$lib/store'
import axios from 'axios'
import { toast } from 'svelte-sonner'
import { goto } from '$app/navigation'

export async function updatePeriod(period: { id: string; start: Date; end: Date; teamId: string }) {
	const form = new FormData()
	form.append('id', period.id)
	form.append('team', USE_COERCE_JSON + JSON.stringify({ id: period.teamId }))
	form.append('start', USE_COERCE_DATE + period.start.toUTCString())
	form.append('end', USE_COERCE_DATE + period.end.toUTCString())
	const res = await axios.postForm(`${get(eventPath)}/admin?/period_update`, form)
	if (res.data.status !== 200) {
		toast.error('Erreur')
		console.error(res.data)
		return
	}
	toast.success('Période mise à jour')
	await goto(get(urlParam).with({ form_period: period.id }), {
		invalidateAll: true,
		replaceState: true,
		noScroll: true,
	})
}
