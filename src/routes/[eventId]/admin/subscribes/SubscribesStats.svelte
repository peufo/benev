<script lang="ts">
	import type { PageData } from './$types'
	import { urlParam } from '$lib/store'
	import Distribution from '$lib/Distribution.svelte'
	import { derived } from 'svelte/store'
	import { SUBSCRIBE_STATE } from '$lib/constant'

	// import type { MembersProfilDistKey, MembershipDistKey } from './getMembers'

	export let data: PageData

	const urlWith = derived(
		urlParam,
		($urlParam) => (params: Record<string, string>) =>
			$urlParam.with(params, 'skip', 'take', 'summary', 'members_stats')
	)
</script>

{#if data.stats}
	<div class="flex flex-col gap-2">
		<Distribution
			title="Inscription initié par un membre ({data.stats.count.user})"
			values={data.stats.dist.user}
			getLabel={(key) => SUBSCRIBE_STATE[key]}
			getHref={(key) => $urlWith({ createdBy: 'user', states: JSON.stringify([key]) })}
		/>

		<Distribution
			title="Inscription initié par le responsable ({data.stats.count.leader})"
			values={data.stats.dist.leader}
			getLabel={(key) => SUBSCRIBE_STATE[key]}
			getHref={(key) => $urlWith({ createdBy: 'leader', states: JSON.stringify([key]) })}
		/>
	</div>
{/if}
