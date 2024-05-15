<script lang="ts">
	import {
		mdiAccountPlusOutline,
		mdiFilterRemoveOutline,
		mdiFormatListBulleted,
		mdiSigma,
	} from '@mdi/js'
	import type { Field, Member } from '@prisma/client'
	import { tick } from 'svelte'
	import { Icon, TabsIcon, urlParam } from 'fuma'
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import { InputSearch, Pagination, Table, TableViewSelect, Card } from 'fuma'

	import { component } from '$lib/utils'
	import { MemberActions, MemberCreateSubscribeDialog, MemberFieldDialog } from '$lib/member'
	import { jsonParse } from '$lib/jsonParse'
	import { getMembersTableFields } from './membersTableFields'
	import MembersCopy from './MembersCopy.svelte'
	import MembersFilter from './MembersFilter.svelte'
	import MembersStats from './MembersStats.svelte'
	import MembersEmails from './MembersEmails.svelte'
	import { eventPath } from '$lib/store'

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

<Card>
	<h2 slot="title">Membres</h2>

	<div class="flex flex-col gap-2">
		<div class="flex gap-x-2 gap-y-2 flex-wrap">
			<InputSearch class="max-w-[175px]" />
			<MembersFilter />

			<div class="grow" />

			<TableViewSelect key="members" views={data.views} action="{$eventPath}/admin" />

			<a
				href={$urlParam.without(...tableFields.map((f) => f.key), 'skip', 'take')}
				class="btn btn-square btn-sm"
			>
				<Icon path={mdiFilterRemoveOutline} title="Effacer les filtres" size={18} />
			</a>

			<TabsIcon
				key="summary"
				defaultValue="false"
				options={{
					false: { icon: mdiFormatListBulleted, label: 'Données' },
					true: { icon: mdiSigma, label: 'Synthèse' },
				}}
			/>

			<MembersCopy fields={data.fields} />
			<MembersEmails />

			<a
				type="button"
				class="btn btn-square btn-sm"
				href={$urlParam.with({ form_invite: 1 })}
				data-sveltekit-noscroll
				data-sveltekit-replacestate
			>
				<Icon path={mdiAccountPlusOutline} />
			</a>
		</div>
		{#key tableFields}
			<Table
				key="members"
				items={data.members}
				fields={tableFields}
				slotAction={(member) =>
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
</Card>

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
