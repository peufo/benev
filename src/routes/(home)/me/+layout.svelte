<script lang="ts">
	import { LayoutMe } from '$lib/me'

	let { data, children } = $props()
</script>

<LayoutMe user={data.user}>
	{@render children?.()}
</LayoutMe>
