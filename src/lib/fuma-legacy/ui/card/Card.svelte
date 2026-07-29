<script lang="ts">
	import { mdiArrowLeft } from '@mdi/js'
	import { Icon } from '$lib/fuma-legacy/ui/icon/index.js'
	import { contextContainer } from '$lib/fuma-legacy/ui/context.js'

	interface Props {
		class?: string
		bodyClass?: string
		headerClass?: string
		returnUrl?: string
		style?: string
		top?: import('svelte').Snippet
		title?: import('svelte').Snippet
		action?: import('svelte').Snippet
		subtitle?: import('svelte').Snippet
		children?: import('svelte').Snippet
	}

	let {
		class: klass = '',
		bodyClass = '',
		headerClass = '',
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

<div class="card border border-hard bg-base-100 shadow-lg {klass}" {style}>
	{@render top?.()}

	<div class="card-body rounded-b-2xl p-2 sm:p-8 {bodyClass}">
		{#if title || action}
			<div class="flex flex-wrap items-center gap-2 {headerClass}">
				{#if returnUrl}
					<a href={returnUrl} class="btn btn-square btn-ghost btn-sm">
						<Icon path={mdiArrowLeft} size={20} />
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
