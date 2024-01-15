<script lang="ts">
	import { mdiChevronRight, mdiSigma } from '@mdi/js'
	import { slide } from 'svelte/transition'
	import { derived } from 'svelte/store'

	import { Icon, InputSearch, Pagination, Table, createFieldsInit } from '$lib/material'
	import { urlParam } from '$lib/store'
	import { component } from '$lib/utils'

	import InviteDialog from '$lib/InviteDialog.svelte'

	import { MemberContact } from '$lib/member'
	import { getTableFields } from './tableFields'
	import MembersCopy from './MembersCopy.svelte'
	import MembersFilter from './MembersFilter.svelte'
	import MembersStats from './MembersStats.svelte'
	import MembersEmails from './MembersEmails.svelte'

	export let data

	const tableFields = getTableFields(data.teams, data.fields)

	const summary = derived(urlParam, ({ has }) => has('summary'))
</script>

<div class="flex flex-col gap-3">
	<div class="flex gap-x-2 gap-y-2 flex-wrap">
		<InputSearch class="max-w-[175px]" />
		<MembersFilter fields={data.fields} teams={data.teams} />

		<a
			class="
				btn btn-sm fill-base-content px-1
				{$summary ? 'btn-active' : 'opacity-70'}
			"
			href={$urlParam.toggle({ summary: 'true' })}
			data-sveltekit-noscroll
		>
			<Icon path={mdiSigma} title="Synthèse" />
			<Icon path={mdiChevronRight} class={$summary ? 'rotate-90' : ''} />
		</a>

		<MembersCopy fields={data.fields} />
		<MembersEmails />
		<InviteDialog justIcon class="btn-sm" />
	</div>

	{#if $summary}
		<div transition:slide={{ duration: 150 }}>
			<MembersStats {data} />
		</div>
	{/if}

	<Table
		key="members"
		items={data.members}
		fields={tableFields}
		action={(member) => component(MemberContact, { user: member.user })}
		placholder="Aucun membre trouvé"
	/>

	<div class="flex justify-end">
		<Pagination />
	</div>
</div>
