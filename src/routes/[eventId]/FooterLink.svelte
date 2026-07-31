<script lang="ts">
	import type { Snippet } from 'svelte'
	import { Icon } from '$lib/fuma-legacy'

	interface Props {
		link: string | null
		/** Chemin d'icône `@mdi/js`, ou un snippet pour une icône sur mesure. */
		icon?: string | Snippet
		protocol?: string
		children?: Snippet<[{ label: string }]>
	}

	let { link, icon = '', protocol = '', children }: Props = $props()
</script>

{#if link}
	{@const label = link.replace(/^http(s)?:\/\/(www\.)?/, '').replace(/\/$/, '')}
	<a
		class="btn btn-sm sm:btn-md btn-ghost flex flex-nowrap items-center max-w-96"
		href="{protocol}{link}"
		target="_blank"
	>
		{#if typeof icon === 'string'}
			{#if icon}<Icon path={icon} />{/if}
		{:else}
			{@render icon()}
		{/if}

		{#if children}{@render children({ label })}{:else}<span>{label}</span>{/if}
	</a>
{/if}
