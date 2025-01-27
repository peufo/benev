<script lang="ts">
	import type { Event } from '@prisma/client'
	import { slide } from 'svelte/transition'
	import { InputText } from 'fuma'
	import { debounce } from '$lib/debounce'

	export let event: Event | undefined = undefined

	let input: HTMLInputElement
	let scrapPending = false
	let icon = event?.icon || null
	let value = ''

	const handleInput = debounce(async () => {
		value = input.value ? `https://${input.value.replace(/https?:\/\//, '')}` : ''
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
	on:input={handleInput}
	classWrapper="flex items-center"
>
	<div slot="append">
		{#if icon || scrapPending}
			<div transition:slide={{ axis: 'x' }} class="w-10 grid place-content-center">
				{#if icon}
					<img src={icon} alt="Icon de l'évènement" class="w-5" />
				{:else if scrapPending}
					<div class="loading loading-ring loading-xs" />
				{/if}
			</div>
		{/if}
	</div>
</InputText>
