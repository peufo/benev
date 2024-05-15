<script lang="ts">
	import type { PageData } from './$types'
	import { urlParam } from '$lib/store'
	import Distribution from './Distribution.svelte'
	import { derived } from 'svelte/store'
	import type { MembersProfilDistKey, MembershipDistKey } from './getMembers'

	export let data: PageData

	const DIST_MEMBERS_LABEL: Record<MembershipDistKey, string> = {
		isValided: 'Validé',
		isValidedByEvent: 'Initié par un responsable',
		isValidedByUser: 'Initié par le membre',
	}

	const DIST_PROFILE_LABEL: Record<MembersProfilDistKey, string> = {
		isComplet: 'Complet',
		isIncomplet: 'Incomplet',
	}

	const urlWith = derived(
		urlParam,
		($urlParam) => (params: Record<string, string>) =>
			$urlParam.with(params, 'skip', 'take', 'summary')
	)
</script>

{#if data.stats}
	
		<Distribution
			title="Adhésions ({data.stats.nbMembers})"
			values={data.stats.membership}
			getLabel={(key) => DIST_MEMBERS_LABEL[key]}
			getHref={(key) =>
				$urlWith({
					isValidedByUser: key === 'isValided' || key === 'isValidedByUser' ? 'true' : 'false',
					isValidedByEvent: key === 'isValided' || key === 'isValidedByEvent' ? 'true' : 'false',
				})}
		/>

		<Distribution
			title="Profils"
			values={data.stats.profileStatus}
			getLabel={(key) => DIST_PROFILE_LABEL[key]}
			getHref={(key) => $urlWith({ isProfileComplet: key === 'isComplet' ? 'true' : 'false' })}
		/>

		<Distribution
			title="Inscriptions acceptées"
			values={data.stats.subscribes.accepted}
			getLabel={(key) =>
				key === '0' ? "Pas d'inscription" : `${key} inscription${+key > 1 ? 's' : ''}`}
			getHref={(key) =>
				$urlWith({ subscribes_count_accepted: JSON.stringify({ min: +key, max: +key }) })}
		/>

		<Distribution
			title="Inscriptions en attentes"
			values={data.stats.subscribes.request}
			getLabel={(key) =>
				key === '0' ? "Pas d'inscription" : `${key} inscription${+key > 1 ? 's' : ''}`}
			getHref={(key) =>
				$urlWith({ subscribes_count_request: JSON.stringify({ min: +key, max: +key }) })}
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

{/if}
