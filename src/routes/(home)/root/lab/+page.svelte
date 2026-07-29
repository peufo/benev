<script lang="ts">
	import { onMount } from 'svelte'
	import { Card } from '$lib/fuma-legacy'
	import { sendEvent } from './lab.remote'

	let events: string[] = $state([])

	onMount(() => {
		const subscription = new EventSource('/root/lab')

		const handleEvent = ({ data }: MessageEvent<string>) => {
			events = [...events, data]
		}

		subscription.addEventListener('hey', handleEvent)

		return () => {
			subscription.removeEventListener('hey', handleEvent)
		}
	})
</script>

<Card class="max-w-3xl mx-auto">
	<form {...sendEvent}>
		<button class="btn"> send event</button>
	</form>

	<hr />

	{#each events as event, i (i)}
		{JSON.stringify(event)}
	{/each}
</Card>
