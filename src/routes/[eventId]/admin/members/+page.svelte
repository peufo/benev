<script lang="ts">
	import { mdiChevronRight, mdiSigma } from '@mdi/js'
	import { slide } from 'svelte/transition'
	import { derived } from 'svelte/store'
	import { goto } from '$app/navigation'

	import type { PageData } from './$types'
	import { Icon, InputSearch, Pagination, Table, type TableField } from '$lib/material'
	import { eventPath, urlParam } from '$lib/store'
	import { getAge, component } from '$lib/utils'
	import { jsonParse } from '$lib/jsonParse'
	import InviteDialog from '$lib/InviteDialog.svelte'

	import MembersCopy from './MembersCopy.svelte'
	import MembersFilter from './MembersFilter.svelte'
	import MembersStats from './MembersStats.svelte'
	import MembersEmails from './MembersEmails.svelte'
	import MemberCell from './MemberCell.svelte'
	import { MemberContact } from '$lib/member'

	export let data

	type Member = PageData['members'][number]
	const toHour = (ms: number) => ms / (1000 * 60 * 60)
	const summary = derived(urlParam, ({ has }) => has('summary'))

	const tableFields: TableField<Member>[] = [
		{
			key: 'member',
			label: 'Membre',
			getCell: (member) => component(MemberCell, { member }),
			locked: true,
		},
		{
			key: 'periods',
			label: 'Périodes',
			getCell: (m) => m.subscribes.length,
			visible: true,
		},
		{
			key: 'hours',
			label: 'Heures',
			getCell: (m) => toHour(m.workTime),
			visible: true,
		},
		{
			key: 'sectors',
			label: 'Secteurs à charges',
			getCell: (m) => m.leaderOf.map(({ name }) => name),
			visible: true,
		},
		{
			key: 'age',
			label: 'Age',
			getCell: (m) => getAge(m.user.birthday),
		},
		{
			key: 'completed',
			label: 'Profil complet',
			getCell: (m) => m.isUserProfileCompleted,
		},
		{
			key: 'isValidedByEvent',
			label: 'Validé par un responsable',
			hint: "Un responsable à confirmé l'inscription du membre",
			getCell: (m) => m.isValidedByEvent,
		},
		{
			key: 'isValidedByUser',
			label: 'Validé par le membre',
			hint: 'Le membre à confirmé son invitation',
			getCell: (m) => m.isValidedByUser,
		},
		...data.fields.map((field) => ({
			key: field.id,
			label: field.name,
			getCell: (m: Member) => {
				const { value } = m.profile.find((f) => f.fieldId === field.id) || { value: '' }
				if (!value) return ''
				if (field.type === 'multiselect') return jsonParse(value, [])
				if (field.type === 'boolean') return value === 'true'
				if (field.type === 'number') return +value
				return value
			},
		})),
	]
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
		items={data.members}
		fields={tableFields}
		action={(member) => component(MemberContact, { user: member.user })}
		placholder="Aucun membre trouvé"
		classRow="hover cursor-pointer"
		on:click={({ detail: { id } }) => goto(`${$eventPath}/admin/members/${id}`)}
	/>

	<div class="flex justify-end">
		<Pagination />
	</div>
</div>
