<script lang="ts">
	import Page from '$lib/pages/Page.svelte'
	import { eventPath } from '$lib/store'
	export let data
</script>

<Page page={data.page} />

{#if data.memberCanRegister}
	<div class="text-center my-8">
		<a href="{$eventPath}/register" class="btn btn-primary"> Je veux devenir bénévole </a>
	</div>
{/if}
