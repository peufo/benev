<script lang="ts">
	import { LayoutMe } from '$lib/me'

	export let data
</script>

<LayoutMe user={data.user}>
	<slot />
</LayoutMe>
