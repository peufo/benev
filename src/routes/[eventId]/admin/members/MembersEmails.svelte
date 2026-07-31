<script lang="ts">
	import { tip } from 'fuma'
	import { MailsIcon } from '@lucide/svelte'
	import { page } from '$app/state'
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
		<span class="inline-flex" use:tip={{ content: 'Envoyer un email aux membres' }}
			><MailsIcon size={18} class="transition-transform {isLoading ? 'scale-75' : ''}" /></span
		>
	{/if}
</button>
