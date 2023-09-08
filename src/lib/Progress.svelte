<script lang="ts">
	import 'tippy.js/dist/tippy.css'
	import { Subscribe } from '@prisma/client'
	import { Icon } from '$lib/material'
	import { mdiSlashForward } from '@mdi/js'

	export let period: { maxSubscribe: number; subscribes: Subscribe[] }

	let klass = ''
	export { klass as class }
	export let withLabel = false

	let container: HTMLDivElement

	let width = 0
	const accepted = period.subscribes.filter((sub) => sub.state === 'accepted').length
	const request = period.subscribes.filter((sub) => sub.state === 'request').length

	const plurial = (n: number) => (n > 1 ? 's' : '')
</script>

<div
	class="flex gap-1 flex-wrap"
	class:items-center={!withLabel}
	class:flex-col={withLabel}
	class:gap-2={withLabel}
>
	<div
		bind:offsetWidth={width}
		bind:this={container}
		class="h-2 rounded bg-base-300 w-full relative overflow-hidden {klass}"
	>
		<div
			class="h-2 bg-warning absolute rounded-r"
			style:width="{width * ((accepted + request) / period.maxSubscribe)}px"
		/>
		<div
			class="h-2 bg-success absolute rounded-r"
			style:width="{width * (accepted / period.maxSubscribe)}px"
		/>
	</div>

	{#if withLabel}
		<div class="flex gap-1">
			<span class="badge badge-success" title="confirmé">
				{accepted}
				<span class="pl-1">
					Confirmé{plurial(accepted)}
				</span>
			</span>
			<span class="badge badge-warning" title="En attente">
				{request}
				<span class="pl-1">
					En attente{plurial(request)}
				</span>
			</span>
			<Icon path={mdiSlashForward} size={18} class="opacity-60" />
			<span class="badge">
				{period.maxSubscribe}
				<span class="pl-1">
					Place{plurial(period.maxSubscribe)}
				</span>
			</span>
		</div>
	{:else}
		<span class="badge badge-sm">
			{accepted + request} / {period.maxSubscribe}
		</span>
	{/if}
</div>
