<script lang="ts">
	import type { Event } from '@prisma/client'
	import { untrack } from 'svelte'
	import { InputText } from '$lib/fuma-legacy'
	import { debounce } from '$lib/debounce'
	import { normalizeUrl } from '$lib/url'
	import { EventIcon } from '.'

	interface Props {
		event?: Event | undefined
	}

	let { event = undefined }: Props = $props()

	let input: HTMLInputElement = $state()!
	let scrapPending = $state(false)
	// Icône affichée: remplacée par le scraping dès que l'URL change.
	let icon = $state(untrack(() => event?.icon) || null)
	let value = $state('')

	const handleInput = debounce(async () => {
		value = normalizeUrl(input.value)
		scrapPending = true
		const res = await fetch(`/api/scrap-icon?site=${value}`)
			.then((res) => res.json())
			.finally(() => (scrapPending = false))
		icon = res.icon
	}, 400)
</script>

<input type="hidden" name="icon" value={icon} />
<input type="hidden" name="web" {value} />

<InputText
	label="Site web"
	value={event?.web || ''}
	bind:inputElement={input}
	oninput={handleInput}
	classWrapper="flex items-center"
>
	{#snippet append()}
		<div>
			{#if icon || scrapPending}
				<div class="w-10 grid place-content-center">
					{#if scrapPending}
						<div class="loading loading-ring loading-xs"></div>
					{:else if icon}
						<EventIcon {icon} class="w-5" />
					{/if}
				</div>
			{/if}
		</div>
	{/snippet}
</InputText>
