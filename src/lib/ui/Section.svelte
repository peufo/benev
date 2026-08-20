<script lang="ts">
	import type { Component, Snippet } from 'svelte'
	import type { IconProps } from '@lucide/svelte'

	interface Props {
		id: string
		title: string
		icon: Component<IconProps>
		subtitle?: string | undefined
		action?: Snippet | undefined
		danger?: boolean
		children: Snippet
	}

	let {
		id,
		title,
		icon: SectionIcon,
		subtitle = undefined,
		action = undefined,
		danger = false,
		children,
	}: Props = $props()
</script>

<section {id} class={['surface scroll-mt-4 p-5', danger && 'border-error/40']}>
	<div class="mb-4 flex items-center gap-2">
		<SectionIcon size={20} class={['shrink-0', danger ? 'text-error' : 'opacity-70']} />
		<div class="grow">
			<h2 class="title">{title}</h2>
			{#if subtitle}
				<p class="text-sm text-base-content/70">{subtitle}</p>
			{/if}
		</div>
		{@render action?.()}
	</div>

	{@render children()}
</section>
