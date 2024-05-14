<script lang="ts">
	import type { PageData } from './$types'
	import { urlParam } from '$lib/store'
	import Distribution from './Distribution.svelte'
	import { derived } from 'svelte/store'

	export let data: PageData

	const DIST_MEMBERS_LABEL: Record<string, string> = {
		isValided: 'Validé par un responsable et par le membre',
		isValidedByEvent: 'Validé par un responsable',
		isValidedByUser: 'Validé par le membre',
	}

	const urlWith = derived(
		urlParam,
		($urlParam) => (params: Record<string, string>) =>
			$urlParam.with(params, 'skip', 'take', 'summary')
	)
</script>

{#if data.stats}
	<div class="flex gap-4 flex-wrap justify-start items-start">
		<Distribution
			title="Membres ({data.stats.nbMembers})"
			values={data.stats.members}
			class="grow min-w-[40%]"
			getLabel={(key) => DIST_MEMBERS_LABEL[key] || ''}
			getHref={(key) =>
				$urlWith({
					isValidedByUser: key === 'isValided' || key === 'isValidedByUser' ? 'true' : 'false',
					isValidedByEvent: key === 'isValided' || key === 'isValidedByEvent' ? 'true' : 'false',
				})}
		/>
		{#each data.stats.summary as stat}
			{#if stat}
				<Distribution
					title={stat.fieldName}
					values={stat.distribution}
					class="grow"
					getLabel={(key) => {
						if (stat?.fieldType !== 'boolean') return key
						return key === 'true' ? 'Oui' : 'Non'
					}}
					getHref={(key) => {
						if (!stat) return ''
						const fieldValue = stat.fieldType === 'multiselect' ? JSON.stringify([key]) : key
						const k = `field_${stat.fieldId}`
						return $urlWith({ [k]: fieldValue })
					}}
				/>
			{/if}
		{/each}
	</div>
{/if}
