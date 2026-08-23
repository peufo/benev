<script lang="ts">
	import type { PageData } from './$types'
	import { urlParam } from 'fuma'
	import Distribution from '$lib/Distribution.svelte'
	import type { MembersProfilDistKey, MembershipDistKey } from './getMembers.server'

	interface Props {
		data: PageData
	}

	let { data }: Props = $props()

	const DIST_MEMBERS_LABEL: Record<MembershipDistKey, string> = {
		isValided: 'Validé',
		isValidedByEvent: 'Initié par un responsable',
		isValidedByUser: 'Initié par le membre',
	}

	const DIST_PROFILE_LABEL: Record<MembersProfilDistKey, string> = {
		isComplet: 'Complet',
		isIncomplet: 'Incomplet',
	}

	// `urlParam` de fuma 2 est un objet runes, plus un store: `derived` n'a plus lieu
	// d'être, la fonction relit l'état réactif à chaque appel.
	const urlWith = (params: Record<string, string>) =>
		urlParam.with(params, 'skip', 'take', 'summary', 'members_stats')
</script>

{#if data.stats}
	<div class="flex flex-col gap-2 min-w-56">
		<Distribution
			title="Adhésions ({data.stats.nbMembers})"
			values={data.stats.membership}
			getLabel={(key) => DIST_MEMBERS_LABEL[key]}
			getHref={(key) =>
				urlWith({
					isValidedByUser: key === 'isValided' || key === 'isValidedByUser' ? 'true' : 'false',
					isValidedByEvent: key === 'isValided' || key === 'isValidedByEvent' ? 'true' : 'false',
				})}
		/>

		<Distribution
			title="Profils"
			values={data.stats.profileStatus}
			getLabel={(key) => DIST_PROFILE_LABEL[key]}
			getHref={(key) => urlWith({ isProfileComplet: key === 'isComplet' ? 'true' : 'false' })}
		/>

		<Distribution
			title="Inscriptions acceptées"
			values={data.stats.subscribes.accepted}
			getLabel={(key) =>
				key === '0' ? "Pas d'inscription" : `${key} inscription${+key > 1 ? 's' : ''}`}
			getHref={(key) =>
				urlWith({ subscribes_count_accepted: JSON.stringify({ min: +key, max: +key }) })}
		/>

		<Distribution
			title="Inscriptions en attentes"
			values={data.stats.subscribes.request}
			getLabel={(key) =>
				key === '0' ? "Pas d'inscription" : `${key} inscription${+key > 1 ? 's' : ''}`}
			getHref={(key) =>
				urlWith({ subscribes_count_request: JSON.stringify({ min: +key, max: +key }) })}
		/>

		{#each data.stats.summary as stat, i (i)}
			{#if stat}
				{@const summary = stat}
				<Distribution
					title={summary.fieldName}
					values={summary.distribution}
					class="grow"
					getLabel={(key) => {
						if (summary.fieldType !== 'boolean') return key
						return key === 'true' ? 'Oui' : 'Non'
					}}
					getHref={(key) => {
						const fieldValue = summary.fieldType === 'multiselect' ? JSON.stringify([key]) : key
						return urlWith({ [`field_${summary.fieldId}`]: fieldValue })
					}}
				/>
			{/if}
		{/each}
	</div>
{/if}
