<script lang="ts">
	import { ArrowLeftIcon } from '@lucide/svelte'
	import { contextContainer } from '$lib/ui/context.js'
	import type { ClassValue } from 'svelte/elements'

	interface Props {
		class?: ClassValue
		bodyClass?: ClassValue
		headerClass?: ClassValue
		returnUrl?: string
		style?: string
		top?: import('svelte').Snippet
		title?: import('svelte').Snippet
		action?: import('svelte').Snippet
		subtitle?: import('svelte').Snippet
		children?: import('svelte').Snippet
	}

	let {
		class: klass,
		bodyClass,
		headerClass,
		returnUrl = '',
		style = '',
		top,
		title,
		action,
		subtitle,
		children,
	}: Props = $props()

	contextContainer.set('card')
</script>

<div class={['card border border-soft bg-base-100', klass]} {style}>
	{@render top?.()}

	<div class="card-body rounded-b-2xl p-2 sm:p-8 {bodyClass}">
		{#if title || action}
			<div class="flex flex-wrap items-center gap-2 {headerClass}">
				{#if returnUrl}
					<a href={returnUrl} class="btn btn-square btn-ghost btn-sm">
						<ArrowLeftIcon size={20} />
					</a>
				{/if}

				<div class="title grow">
					{@render title?.()}
				</div>
				{@render action?.()}
			</div>

			{#if subtitle}
				<div class="my-4 text-sm opacity-80">
					{@render subtitle?.()}
				</div>
			{/if}
		{/if}

		{@render children?.()}
	</div>
</div>
