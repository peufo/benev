<script lang="ts">
	export let href: string
	export let title = ''
	let klass = ''
	export { klass as class }
</script>

<div
	class="
		{klass} relative
    shadow hover:shadow-md transition-all
    bg-base-100 border rounded-lg p-2 sm:p-5
  "
>
	{#if title}
		<h2 class="font-medium mb-2">
			{title}
		</h2>
	{/if}
	<slot />
	<a {href} class="absolute inset-0">{' '}</a>
</div>
