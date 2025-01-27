<script lang="ts">
	import type { Event } from '@prisma/client'
	import { InputText } from 'fuma'
	import { debounce } from '$lib/debounce'

	export let event: Event | undefined = undefined

	let input: HTMLInputElement
	let scrapPending = false
	let addressLabel = event?.addressLabel || null

	const handleInput = debounce(async () => {
		const address = encodeURI(input.value)
		if (!address) {
			addressLabel = null
			return
		}
		scrapPending = true
		const res = await fetch(`/api/scrap-address?address=${address}`)
			.then((res) => res.json())
			.finally(() => (scrapPending = false))
		addressLabel = res.addressLabel || ''
	}, 400)
</script>

<input type="hidden" name="addressLabel" value={addressLabel} />

<InputText
	label="Lieu"
	key="address"
	value={event?.address || ''}
	bind:inputElement={input}
	on:input={handleInput}
	classWrapper="flex items-center"
	hint={addressLabel ?? ''}
/>
