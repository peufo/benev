<script lang="ts">
	import PageForm from './PageForm.svelte'

	export let data
</script>

<PageForm page={data.page} charterAlreadyExist={!!data.pages.find((p) => p.type === 'charter')} />
