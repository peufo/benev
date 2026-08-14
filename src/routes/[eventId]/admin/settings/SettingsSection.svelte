<script lang="ts">
	import type { Component, Snippet } from 'svelte'
	import type { IconProps } from '@lucide/svelte'

	interface Props {
		/** Sert d'ancre à `SettingsAnchorBar` et de cible au défilement de validation. */
		id: string
		title: string
		icon: Component<IconProps>
		subtitle?: string | undefined
		/** Rendu à droite de l'en-tête, comme le `action` de `Card`. */
		action?: Snippet | undefined
		/** Opérations irréversibles: la bordure et le titre passent en `error`. */
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

<!-- `scroll-mt-4`: une marge d'aération pour les ancres du rail admin comme pour le
     `scrollIntoView` du premier champ invalide. -->
<!-- `.surface` porte le fond, le rayon et la bordure des panneaux de premier niveau; son
     `p-1` est prévu pour des listes de menus, d'où le `p-5` du contenu de réglage. -->
<section {id} class={['surface scroll-mt-4 p-5', danger && 'border-error/40']}>
	<div class="mb-4 flex items-center gap-3">
		<SectionIcon size={20} class={['shrink-0', danger ? 'text-error' : 'opacity-70']} />
		<div class="grow">
			<!-- Le titre reste en encre courante même en zone de danger: `error` mesure 2.87:1
			     sur `base-100`, la bordure et le bouton portent le signal. -->
			<h2 class="title">{title}</h2>
			{#if subtitle}
				<p class="text-sm text-base-content/70">{subtitle}</p>
			{/if}
		</div>
		{@render action?.()}
	</div>

	{@render children()}
</section>
