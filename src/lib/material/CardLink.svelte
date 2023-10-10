<script lang="ts">
	export let href: string
	let klass = ''
	export {klass as class}
</script>

<a
	{href}
	class="
		{klass} block
    shadow hover:shadow-md transition-shadow
    bg-base-100 border rounded-lg p-5
  "
>
	<li>
		<h2 class="font-medium mb-2">
			<slot name="title" />
		</h2>
		<slot />
	</li>
</a>
