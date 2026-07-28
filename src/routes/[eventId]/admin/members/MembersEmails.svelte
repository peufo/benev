<script lang="ts">
	import { mdiEmailMultipleOutline } from '@mdi/js'

	import { page } from '$app/state'
	import { Icon } from '$lib/fuma'
	import { api } from '$lib/api'

	const getMembersEmails = async () => {
		const { emails } = await $api.eventGet<{ emails: string[] }>(
			`/admin/members/email?${page.url.searchParams.toString()}`
		)
		return emails
	}

	let isLoading = $state(false)

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

<button class="btn btn-square btn-sm" onclick={handleMailing} class:btn-disabled={isLoading}>
	{#if isLoading}
		<span class="loading loading-spinner scale-125 text-secondary"></span>
	{:else}
		<Icon
			path={mdiEmailMultipleOutline}
			size={18}
			title="Envoyer un email aux membres"
			class="transition-transform {isLoading ? 'scale-75' : ''}"
		/>
	{/if}
</button>
