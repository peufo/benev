<script lang="ts">
	import { importSource } from './importSource.svelte'

	let { children } = $props()

	importSource.init()
</script>

<div class="max-w-3xl mx-auto w-full space-y-3">
	{@render children()}
</div>
