<script lang="ts">
	export let href: string
	let klass = ''
	export { klass as class }
</script>

<div
	class="
		{klass} relative
    shadow hover:shadow-md transition-all
    bg-base-100 border rounded-lg p-5
  "
>
	<a {href} class="absolute inset-0">{' '}</a>
	<h2 class="font-medium mb-2">
		<slot name="title" />
	</h2>
	<slot />
</div>
