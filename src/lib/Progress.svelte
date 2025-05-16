<script lang="ts">
	import 'tippy.js/dist/tippy.css'
	import type { Subscribe } from '@prisma/client'
	import { Icon } from 'fuma'
	import { mdiSlashForward } from '@mdi/js'

	export let period: {
		maxSubscribe: number
		subscribes: (Subscribe & { member: { isValidedByUser: boolean } })[]
	}

	let klass = ''
	export { klass as class }
	export let withLabel = false
	export let badgeClass = ''
	export let progressClass = ''

	$: accepted = period.subscribes.filter(
		(sub) => sub.state === 'accepted' && !sub.isForcedValidation
	).length
	$: acceptedForced = period.subscribes.filter(
		(sub) => sub.state === 'accepted' && sub.isForcedValidation
	).length
	$: request = period.subscribes.filter((sub) => sub.state === 'request').length
	$: requestWaitUser = period.subscribes.filter(
		(sub) => sub.state === 'request' && sub.member.isValidedByUser
	).length
	$: isComplet = accepted + request >= period.maxSubscribe

	const plurial = (n: number) => (n > 1 ? 's' : '')
</script>

<div
	class="flex gap-1 flex-wrap {klass}"
	class:items-center={!withLabel}
	class:flex-col={withLabel}
	class:gap-2={withLabel}
>
	<div class="h-2 rounded w-full relative overflow-hidden bg-base-300 {progressClass}">
		<div
			class="h-2 bg-error absolute rounded-r"
			style:width="{100 * ((accepted + request) / period.maxSubscribe)}%"
		/>
		<div
			class="h-2 bg-warning absolute rounded-r"
			style:width="{100 * ((accepted + requestWaitUser) / period.maxSubscribe)}%"
		/>
		<div
			class="h-2 bg-blue-500 absolute rounded-r"
			style:width="{100 * ((accepted + acceptedForced) / period.maxSubscribe)}%"
		/>
		<div
			class="h-2 bg-success absolute rounded-r"
			style:width="{100 * (accepted / period.maxSubscribe)}%"
		/>
	</div>

	{#if withLabel}
		<div class="flex gap-1">
			<span class="badge badge-success" title="confirmé">
				{accepted + acceptedForced}
				<span class="pl-1">
					Confirmé{plurial(accepted + acceptedForced)}
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
		<slot name="before-badge" />
		<span class="badge badge-sm whitespace-nowrap {badgeClass}" class:bg-base-200={isComplet}>
			{accepted + acceptedForced + request} / {period.maxSubscribe}
		</span>
		<slot name="after-badge" />
	{/if}
</div>
