<script lang="ts">
	import { mdiChevronRight, mdiFormatListBulleted, mdiSigma } from '@mdi/js'
	import { slide } from 'svelte/transition'
	import { derived } from 'svelte/store'

	import { Icon, InputSearch, Pagination, Table, TabsSmall } from '$lib/material'
	import { urlParam } from '$lib/store'
	import { component } from '$lib/utils'

	import InviteDialog from '$lib/InviteDialog.svelte'

	import { MemberContact } from '$lib/member'
	import { getTableFields } from './tableFields'
	import MembersCopy from './MembersCopy.svelte'
	import MembersFilter from './MembersFilter.svelte'
	import MembersStats from './MembersStats.svelte'
	import MembersEmails from './MembersEmails.svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'

	export let data

	const tableFields = getTableFields(data.teams, data.fields)
</script>

<div class="flex flex-col gap-3">
	<div class="flex gap-x-2 gap-y-2 flex-wrap">
		<InputSearch class="max-w-[175px]" />
		<MembersFilter />

		<div class="grow" />

		<TabsSmall
			on:click={() =>
				goto($urlParam.toggle({ summary: 'true' }), { keepFocus: true, noScroll: true })}
			options={{
				false: { icon: mdiFormatListBulleted, label: 'Données' },
				true: { icon: mdiSigma, label: 'Synthèse' },
			}}
			activeValue={data.summary ? 'true' : 'false'}
		/>

		<MembersCopy fields={data.fields} />
		<MembersEmails />
		<InviteDialog justIcon class="btn-sm" />
	</div>

	<Table
		key="members"
		items={data.members}
		fields={tableFields}
		action={(member) => component(MemberContact, { user: member.user })}
		placholder="Aucun membre trouvé"
		hideBody={data.summary}
	/>

	{#if !data.summary}
		<div class="flex justify-end">
			<Pagination />
		</div>
	{:else}
		<MembersStats {data} />
	{/if}
</div>
