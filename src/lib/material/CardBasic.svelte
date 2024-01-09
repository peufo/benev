<script lang="ts">
	export let title = ''
	let klass = ''
	export { klass as class }
	export let style = ''
</script>

<div class="{klass} bg-base-100 border rounded-lg p-2 sm:p-5" {style}>
	{#if title}
		<h2 class="font-medium mb-2">
			{title}
		</h2>
	{/if}
	<slot />
</div>
