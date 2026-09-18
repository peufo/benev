<script lang="ts">
	import type { ClassValue } from 'svelte/elements'
	import type { Snippet } from 'svelte'
	import { ArrowLeftIcon } from '@lucide/svelte'
	import { tip } from 'fuma'

	interface Props {
		id?: string
		title?: string
		subtitle?: string
		/** Un bouton de retour à la page précédente, à gauche du titre */
		back?: boolean
		/** Rendu à droite du titre: des boutons `btn-sm`, à la hauteur d'un `.title` */
		action?: Snippet
		class?: ClassValue
		children?: Snippet
	}

	let { id, title, subtitle, back = false, action, class: klass, children }: Props = $props()
</script>

<section {id} class={['surface scroll-mt-4', klass]}>
	{#if title || back || action}
		<div class={['flex items-start gap-2 flex-wrap pb-4', !back && 'pl-2', !action && 'pr-1']}>
			{#if back}
				<button
					type="button"
					class="btn btn-square btn-ghost btn-sm shrink-0"
					aria-label="Retour"
					onclick={() => history.back()}
					use:tip={{ content: 'Retour' }}
				>
					<ArrowLeftIcon size={20} class="opacity-70" />
				</button>
			{/if}
			{#if title || subtitle}
				<div class="grow pt-1">
					{#if title}
						<h2 class="title-md opacity-80">{title}</h2>
					{/if}
					{#if subtitle}
						<p class="text-sm text-base-content/70">{subtitle}</p>
					{/if}
				</div>
			{/if}
			{#if action}
				<div class="flex gap-2 ml-auto flex-wrap">
					{@render action()}
				</div>
			{/if}
		</div>
	{/if}
	{@render children?.()}
</section>
