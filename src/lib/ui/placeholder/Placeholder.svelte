<script lang="ts">
	interface Props {
		class?: string
		style?: string
		children?: import('svelte').Snippet
	}

	let { class: klass = '', style = '', children }: Props = $props()
</script>

<div
	{style}
	class="
		rounded-box p-2 bg-base-200/40 h-32 grid place-content-center
		text-base-content/60
		{klass}
	"
>
	{#if children}{@render children()}{:else}Aucun élément{/if}
</div>
