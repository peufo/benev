<script lang="ts">
	import { mdiContentDuplicate } from '@mdi/js'
	import type { Period } from '@prisma/client'
	import { invalidateAll } from '$app/navigation'
	import { Icon } from 'fuma'
	import { eventPath } from '$lib/store'
	import axios from 'axios'
	import { createEventDispatcher } from 'svelte'

	export let period: Period
	const dispatch = createEventDispatcher<{ success: void }>()

	let isLoading = false

	async function handleClick() {
		isLoading = true
		await duplicatePeriod().finally(() => (isLoading = false))
		dispatch('success')
	}

	async function duplicatePeriod() {
		if (!period) return
		const { start, end } = period
		const duration = end.getTime() - start.getTime()
		const form = new FormData()
		form.append('id', period.id)
		form.append('maxSubscribe', String(period.maxSubscribe))
		form.append('start', end.toUTCString())
		form.append('end', new Date(end.getTime() + duration).toUTCString())
		await axios.postForm(`${$eventPath}/teams/${period.teamId}?/period_create`, form)
		await invalidateAll()
	}
</script>

<button class="btn btn-sm btn-square" disabled={isLoading} on:click={handleClick}>
	<Icon
		path={mdiContentDuplicate}
		size={20}
		class="opacity-60"
		title="Ajouter une période après"
		tippyProps={{ appendTo: 'parent' }}
	/>
</button>
