<script lang="ts">
	import { importSource } from './importSource.svelte'

	let { children } = $props()

	importSource.init()
</script>

{@render children()}
