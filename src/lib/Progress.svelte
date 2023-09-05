<script lang="ts">
	import tippy, { type Props as TippyProps } from 'tippy.js'
	import 'tippy.js/dist/tippy.css'
	import { Period, Subscribe } from '@prisma/client'
	import { onMount } from 'svelte'

	export let period: Period & { subscribes: Subscribe[] }
	export let tippyProps: Partial<TippyProps> = {}
	let klass = ''
	export { klass as class }

	let container: HTMLDivElement

	let width = 0
	const accepted = period.subscribes.filter((sub) => sub.state === 'accepted').length
	const request = period.subscribes.filter((sub) => sub.state === 'request').length

	onMount(() => {
		const plurial = (n: number) => (n > 1 ? 's' : '')
		const content = document.createElement('div')
		content.innerHTML = [
			`${period.maxSubscribe} place${plurial(period.maxSubscribe)}`,
			`${accepted} confirmé${plurial(accepted)}`,
			`${request} en attente`,
		].join('<br>')
		const tip = tippy(container, { content, placement: 'right', ...tippyProps })
		return () => tip.destroy()
	})
</script>

<div
	bind:offsetWidth={width}
	bind:this={container}
	class="h-2 rounded bg-base-300 w-full relative {klass}"
>
	<div
		class="h-2 bg-warning absolute rounded"
		style:width="{width * ((accepted + request) / period.maxSubscribe)}px"
	/>
	<div
		class="h-2 bg-success absolute rounded"
		style:width="{width * (accepted / period.maxSubscribe)}px"
	/>
</div>
