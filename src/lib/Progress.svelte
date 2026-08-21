<script lang="ts">
	import type { Snippet } from 'svelte'
	import { countSubscribes, type PeriodCountable } from '$lib/subscribe/subscribesCount'

	interface Props {
		period: PeriodCountable
		class?: string
		withLabel?: boolean
		badgeClass?: string
		progressClass?: string
		beforeBadge?: Snippet
		afterBadge?: Snippet
	}

	let {
		period,
		class: klass = '',
		withLabel = false,
		badgeClass = '',
		progressClass = '',
		beforeBadge,
		afterBadge,
	}: Props = $props()

	const count = $derived(countSubscribes(period))

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
			style:width="{100 * ((count.accepted + count.request) / count.total)}%"
		></div>
		<div
			class="h-2 bg-warning absolute rounded-r"
			style:width="{100 * ((count.accepted + count.requestWaitUser) / count.total)}%"
		></div>
		<div
			class="h-2 bg-blue-500 absolute rounded-r"
			style:width="{100 * (count.accepted / count.total)}%"
		></div>
		<div
			class="h-2 bg-success absolute rounded-r"
			style:width="{100 * (count.acceptedByMember / count.total)}%"
		></div>
	</div>

	{#if withLabel}
		<div class="flex gap-1">
			<span class="badge badge-success" title="confirmé">
				{count.accepted}
				<span class="pl-1">
					Confirmé{plurial(count.accepted)}
				</span>
			</span>
			<span class="badge badge-warning" title="En attente">
				{count.request}
				<span class="pl-1">
					En attente{plurial(count.request)}
				</span>
			</span>
			<span class="opacity-50 px-1">/</span>
			<span class="badge">
				{count.maxSubscribe}
				<span class="pl-1">
					Place{plurial(count.maxSubscribe)}
				</span>
			</span>
		</div>
	{:else}
		{@render beforeBadge?.()}
		<span class="badge badge-sm whitespace-nowrap {badgeClass}" class:bg-base-200={count.isComplet}>
			{count.accepted + count.request} / {count.maxSubscribe}
		</span>
		{@render afterBadge?.()}
	{/if}
</div>
