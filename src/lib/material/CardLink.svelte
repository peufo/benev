<script lang="ts">
	export let href: string
</script>

<a
	{href}
	class="
		block
    shadow hover:shadow-md transition-shadow
    bg-base-100 border rounded-lg p-6
  "
>
	<li>
		<h2 class="font-medium mb-2">
			<slot name="title" />
		</h2>
		<slot />
	</li>
</a>
