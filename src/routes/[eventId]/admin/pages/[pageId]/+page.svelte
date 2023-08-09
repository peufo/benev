<script lang="ts">
	import PageForm from './PageForm.svelte'

	export let data
</script>

{#key data.page}
	<PageForm page={data.page} />
{/key}
