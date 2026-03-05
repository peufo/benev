<script lang="ts">
	import { eventPath } from '$lib/store'
	import { tip } from 'fuma'
	import { CalendarArrowUp } from 'lucide-svelte'
	import { page } from '$app/stores'

	let loading = false

	async function downloadCalendar() {
		loading = true
		try {
			const res = await fetch($eventPath + '/api/ical')
			if (!res.ok) throw new Error()
			const blob = await res.blob()
			const url = URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = `${$page.data.event?.name || 'mon-benevolat'}.ics`
			a.click()
			URL.revokeObjectURL(url)
		} catch {
		} finally {
			loading = false
		}
	}
</script>

<button
	class="btn btn-square btn-sm"
	disabled={loading}
	on:click={downloadCalendar}
	use:tip={{ content: 'Ajouter à mon agenda' }}
>
	{#if loading}
		<span class="loading loading-spinner loading-xs" />
	{:else}
		<CalendarArrowUp size={20} />
	{/if}
</button>
