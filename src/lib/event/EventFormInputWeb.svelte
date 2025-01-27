<script lang="ts">
	import type { Event } from '@prisma/client'
	import { slide } from 'svelte/transition'
	import { InputText } from 'fuma'
	import { debounce } from '$lib/debounce'

	export let event: Event | undefined = undefined

	let webInput: HTMLInputElement
	let scrapIconPending = false
	let icon = event?.icon || null
	let webValue = ''

	const handleWebInput = debounce(async () => {
		webValue = webInput.value ? `https://${webInput.value.replace(/https?:\/\//, '')}` : ''
		scrapIconPending = true
		const res = await fetch(`/api/scrap?site=${webValue}`)
			.then((res) => res.json())
			.finally(() => (scrapIconPending = false))
		icon = res.icon
	}, 400)
</script>

<input type="hidden" name="icon" value={icon} />
<input type="hidden" name="web" value={webValue} />

<InputText
	label="Site web"
	value={event?.web || ''}
	bind:inputElement={webInput}
	on:input={handleWebInput}
	classWrapper="flex items-center"
>
	<div slot="append">
		{#if icon || scrapIconPending}
			<div transition:slide={{ axis: 'x' }} class="w-10 grid place-content-center">
				{#if icon}
					<img src={icon} alt="Icon de l'évènement" class="w-5" />
				{:else if scrapIconPending}
					<div class="loading loading-ring loading-xs" />
				{/if}
			</div>
		{/if}
	</div>
</InputText>
