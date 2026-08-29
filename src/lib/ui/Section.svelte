<script lang="ts">
	import type { ClassValue } from 'svelte/elements'
	import type { Component, Snippet } from 'svelte'
	import { ArrowLeftIcon, type IconProps } from '@lucide/svelte'
	import { tip } from 'fuma'

	interface Props {
		id: string
		title: string
		icon?: Component<IconProps>
		/** Remplace l'icône par un bouton de retour à la page précédente */
		back?: boolean
		subtitle?: string | undefined
		action?: Snippet | undefined
		danger?: boolean
		children?: Snippet
		class?: ClassValue
	}

	let {
		id,
		title,
		icon: SectionIcon,
		back = false,
		subtitle,
		action,
		danger = false,
		children,
		class: klass,
	}: Props = $props()
</script>

<section {id} class={['surface scroll-mt-4 p-5 space-y-4', danger && 'border-error/40', klass]}>
	<div class="flex items-start gap-2 flex-wrap">
		<div class="flex gap-4 grow">
			{#if back}
				<button
					type="button"
					class="btn btn-square btn-ghost btn-sm -ml-2 shrink-0"
					aria-label="Retour"
					onclick={() => history.back()}
					use:tip={{ content: 'Retour' }}
				>
					<ArrowLeftIcon size={20} class={danger ? 'text-error' : 'opacity-70'} />
				</button>
			{:else if SectionIcon}
				<SectionIcon
					size={20}
					class={['shrink-0 translate-y-1', danger ? 'text-error' : 'opacity-70']}
				/>
			{/if}
			<div>
				<h2 class="title">{title}</h2>
				{#if subtitle}
					<p class="text-sm text-base-content/70">{subtitle}</p>
				{/if}
			</div>
		</div>
		{#if action}
			<div class="flex gap-2 ml-auto">
				{@render action?.()}
			</div>
		{/if}
	</div>

	{@render children?.()}
</section>
