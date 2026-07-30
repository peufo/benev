<script lang="ts">
	import type { ClassValue } from 'svelte/elements'
	import logo from '$lib/assets/logo.svg'
	import EventIcon from './EventIcon.svelte'

	interface Props {
		event: { name: string; posterId: string | null; icon: string | null }
		/** Preset media servi pour l'affiche. */
		size?: 'small' | 'a6' | 'a5'
		/** Dimensions de la vignette, à passer par le parent. */
		class?: ClassValue
		/** Échelle du logo de repli, accordée à `class`. */
		fallbackClass?: ClassValue
	}

	let { event, size = 'a5', class: klass, fallbackClass = 'w-9' }: Props = $props()

	// En base, `icon` vaut le plus souvent '' et parfois la chaîne 'undefined' — vestiges
	// du scrap de favicon. Sans ce filtre, `EventIcon` tente de les charger et échoue.
	let icon = $derived(event.icon?.startsWith('http') ? event.icon : null)
</script>

{#if event.posterId}
	<img
		src="/media/{event.posterId}?size={size}"
		alt="Affiche de {event.name}"
		class={['rounded-lg border border-soft object-cover', klass]}
	/>
{:else if icon}
	<div class={['grid place-content-center rounded-lg border border-soft bg-base-100', klass]}>
		<EventIcon {icon} alt="" class="h-2/3 w-2/3" />
	</div>
{:else}
	<div class={['grid place-content-center rounded-lg border border-soft bg-base-100', klass]}>
		<img src={logo} alt="" class={['opacity-40 grayscale', fallbackClass]} />
	</div>
{/if}
