<script lang="ts">
	import type { PageData } from './$types'
	import { mdiEmailMultipleOutline } from '@mdi/js'

	import { page } from '$app/stores'
	import { Icon } from 'fuma'
	import { api } from '$lib/api'

	const getMembersEmails = async () => {
		const { emails } = await $api.get<{ emails: string[] }>(
			`/admin/members/email?${$page.url.searchParams.toString()}`
		)
		return emails
	}

	let isLoading = false

	async function handleMailing() {
		if (isLoading) return
		isLoading = true
		const membersMail = await getMembersEmails().finally(() => (isLoading = false))
		const a = document.createElement('a')
		a.classList.add('hidden')
		a.href = `mailto:${membersMail.join(';')}`
		a.target = '_blank'
		document.body.appendChild(a)
		a.click()
		a.remove()
	}
</script>

<button class="btn btn-square btn-sm" on:click={handleMailing} class:btn-disabled={isLoading}>
	{#if isLoading}
		<span class="loading loading-spinner scale-125 text-secondary" />
	{:else}
		<Icon
			path={mdiEmailMultipleOutline}
			size={18}
			title="Envoyer un email aux membres"
			class="transition-transform {isLoading ? 'scale-75' : ''}"
		/>
	{/if}
</button>
