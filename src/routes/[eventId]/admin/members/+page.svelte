<script lang="ts">
	import { mdiFormatListBulleted, mdiSigma } from '@mdi/js'
	import type { Field, Member } from '@prisma/client'
	import { tick } from 'svelte'
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'

	import { InputSearch, Pagination, Table, TabsSmall, TableViewSelect } from '$lib/material'
	import { component } from '$lib/utils'
	import InviteDialog from '$lib/InviteDialog.svelte'
	import { MemberActions, MemberCreateSubscribeDialog, MemberFieldDialog } from '$lib/member'
	import { jsonParse } from '$lib/jsonParse'
	import { getMembersTableFields } from './membersTableFields'
	import MembersCopy from './MembersCopy.svelte'
	import MembersFilter from './MembersFilter.svelte'
	import MembersStats from './MembersStats.svelte'
	import MembersEmails from './MembersEmails.svelte'

	export let data

	let tableFields = getMembersTableFields(data.teams, data.fields)

	let memberFieldDialog: MemberFieldDialog
	let createSubscribeDialog: HTMLDialogElement
	let selectedMember: (Member & { user: { firstName: string } }) | undefined = undefined

	async function handleFieldCreated(field: Field | undefined) {
		if (!field) return
		const url = new URL($page.url)
		const PARAM_VISIBLE_KEY = 'members_fields_visible'
		const fieldsVisible = jsonParse<string[]>(url.searchParams.get(PARAM_VISIBLE_KEY), [])
		fieldsVisible.push(`field_${field.id}`)
		console.log(fieldsVisible)
		url.searchParams.set(PARAM_VISIBLE_KEY, JSON.stringify(fieldsVisible))
		await goto(url, { noScroll: true, keepFocus: true, invalidateAll: true })
		tableFields = getMembersTableFields(data.teams, data.fields)
	}
</script>

<div class="flex flex-col gap-2">
	<div class="flex gap-x-2 gap-y-2 flex-wrap">
		<InputSearch class="max-w-[175px]" />
		<MembersFilter />

		<div class="grow" />

		<TableViewSelect key="members" views={data.views} />
		<TabsSmall
			key="summary"
			defaultValue="false"
			options={{
				false: { icon: mdiFormatListBulleted, label: 'Données' },
				true: { icon: mdiSigma, label: 'Synthèse' },
			}}
		/>

		<MembersCopy fields={data.fields} />
		<MembersEmails />
		<InviteDialog justIcon class="btn-sm" />
	</div>
	{#key tableFields}
		<Table
			key="members"
			items={data.members}
			fields={tableFields}
			action={(member) =>
				component(MemberActions, {
					member,
					async onSubscribeDialog() {
						selectedMember = member
						await tick()
						createSubscribeDialog.showModal()
					},
				})}
			placholder="Aucun membre trouvé"
			hideBody={data.summary}
			onCreateField={() => memberFieldDialog.open()}
		/>
	{/key}

	{#if !data.summary}
		<div class="flex justify-end">
			<Pagination />
		</div>
	{:else}
		<MembersStats {data} />
	{/if}
</div>

<MemberFieldDialog
	successUpdate={false}
	bind:this={memberFieldDialog}
	on:success={({ detail }) => handleFieldCreated(detail)}
/>

{#if selectedMember}
	<MemberCreateSubscribeDialog
		bind:dialog={createSubscribeDialog}
		memberId={selectedMember.id}
		title="Nouvelle inscription pour {selectedMember.user.firstName}"
	/>
{/if}
