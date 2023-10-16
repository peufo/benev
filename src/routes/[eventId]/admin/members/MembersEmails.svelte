<script lang="ts">
	import type { PageData } from './$types'
	import axios from 'axios'
	import { Icon } from '$lib/material'

	import { eventPath } from '$lib/store'
	import { page } from '$app/stores'
	import { mdiEmailMultipleOutline } from '@mdi/js'

	type Member = PageData['members'][number]

	const getMembers = async () => {
		const searchParams = $page.url.searchParams
		searchParams.append('all', 'true')
		const { data } = await axios.get<{ members: Member[] }>(
			`${$eventPath}/admin/members?${searchParams.toString()}`
		)
		return data.members
	}

	let isLoading = false

	async function handleMailing() {
		if (isLoading) return
		isLoading = true
		const members = await getMembers().finally(() => (isLoading = false))
		const emails = members.map((m) => m.user.email)
		const a = document.createElement('a')
		a.classList.add('hidden')
		a.href = `mailto:${emails.join(';')}`
		a.target = '_blank'
		document.body.appendChild(a)
		a.click()
		a.remove()
	}
</script>

<div class="relative">
	{#if isLoading}
		<span class="absolute left-1 top-1 loading loading-spinner scale-125 text-secondary" />
	{/if}
	<button class="btn btn-square btn-sm" on:click={handleMailing} class:btn-disabled={isLoading}>
		<Icon
			path={mdiEmailMultipleOutline}
			size={18}
			title="Envoyer un email aux membres"
			class="transition-transform {isLoading ? 'scale-75' : ''}"
		/>
	</button>
</div>
