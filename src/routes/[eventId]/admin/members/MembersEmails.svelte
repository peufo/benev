<script lang="ts">
	import { tip } from 'fuma'
	import { MailsIcon } from '@lucide/svelte'
	import { page } from '$app/state'
	import { getMembersEmails } from './members.remote'

	let isLoading = $state(false)

	async function handleMailing() {
		if (isLoading) return
		isLoading = true
		try {
			const membersMail = await getMembersEmails(page.url.searchParams.toString())
			const a = document.createElement('a')
			a.classList.add('hidden')
			a.href = `mailto:${membersMail.join(';')}`
			a.target = '_blank'
			document.body.appendChild(a)
			a.click()
			a.remove()
		} finally {
			isLoading = false
		}
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
