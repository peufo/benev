<script lang="ts">
	import type { IconProps } from '@lucide/svelte'
	import type { Component, Snippet } from 'svelte'

	interface Props {
		link: string | null
		icon?: Component<IconProps>
		/** Pour ce que Lucide ne fournit pas: un logo de marque, l'icône propre à l'évènement. */
		logo?: Snippet
		protocol?: string
		children?: Snippet<[{ label: string }]>
	}

	let { link, icon: Icon, logo, protocol = '', children }: Props = $props()
</script>

{#if link}
	{@const label = link.replace(/^http(s)?:\/\/(www\.)?/, '').replace(/\/$/, '')}
	<a
		class="btn btn-sm sm:btn-md btn-ghost flex flex-nowrap items-center max-w-96"
		href="{protocol}{link}"
		target="_blank"
	>
		{#if logo}{@render logo()}{:else if Icon}<Icon />{/if}

		{#if children}
			{@render children({ label })}
		{:else}
			<span class="truncate">{label}</span>
		{/if}
	</a>
{/if}
