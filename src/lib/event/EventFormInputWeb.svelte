<script lang="ts">
	import type { Event } from '@prisma/client'
	import { untrack } from 'svelte'
	import { InputString } from 'fuma'
	import { debounce } from '$lib/debounce'
	import { normalizeUrl } from '$lib/url'
	import { EventIcon } from '.'

	interface Props {
		event?: Event | undefined
	}

	let { event = undefined }: Props = $props()

	let scrapPending = $state(false)
	// Icône affichée: remplacée par le scraping dès que l'URL change.
	let icon = $state(untrack(() => event?.icon) || null)
	// Ce qui est saisi, puis ce qui est soumis: `normalizeUrl` préfixe le schéma. Les deux
	// partent de la valeur enregistrée, sinon un formulaire validé sans toucher au champ
	// effacerait le site web.
	let typed = $state(untrack(() => event?.web) || '')
	let value = $state(untrack(() => event?.web) || '')

	const handleInput = debounce(async () => {
		value = normalizeUrl(typed)
		scrapPending = true
		const res = await fetch(`/api/scrap-icon?site=${value}`)
			.then((res) => res.json())
			.finally(() => (scrapPending = false))
		icon = res.icon
	}, 400)
</script>

<input type="hidden" name="icon" value={icon} />
<input type="hidden" name="web" {value} />

<div class="flex items-end gap-2">
	<InputString label="Site web" class="grow" bind:value={typed} oninput={handleInput} />

	{#if icon || scrapPending}
		<div class="w-10 h-10 grid place-content-center">
			{#if scrapPending}
				<div class="loading loading-ring loading-xs"></div>
			{:else if icon}
				<EventIcon {icon} class="w-5" />
			{/if}
		</div>
	{/if}
</div>
