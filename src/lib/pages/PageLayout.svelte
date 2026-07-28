<script lang="ts">
	interface Props {
		class?: string
		children?: import('svelte').Snippet
	}

	let { class: klass = '', children }: Props = $props()
</script>

<div class="card bg-base-100 mx-auto prose p-6 shadow-md {klass}">
	{@render children?.()}
</div>
