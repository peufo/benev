<script lang="ts">
	import { FilterXIcon, SigmaIcon, UserPlusIcon } from '@lucide/svelte'
	import type { Field, Member } from '@prisma/client'
	import { onMount, tick, untrack } from 'svelte'
	import { goto } from '$app/navigation'
	import { InputSearch, Card, Badge } from '$lib/ui'
	import TableViewSelect from '$lib/view/TableViewSelect.svelte'
	import { Drawer, tip } from 'fuma'
	import { Pagination } from 'fuma'
	import { Table } from 'fuma'
	import { urlParam } from 'fuma'
	import { jsonParse } from 'fuma'
	import { MemberActions, MemberCell, MemberCreateSubscribeDialog } from '$lib/member'
	import { getMembersTableFields, getSubscribedTeams } from './membersTableFields'
	import { msToHours } from './msToHours'
	import type { MemberWithComputedValue } from './getMembers.server'
	import MembersExport from './MembersExport.svelte'
	import MembersFilter from './MembersFilter.svelte'
	import MembersBadges from './MembersBadges.svelte'
	import MembersStats from './MembersStats.svelte'
	import MembersEmails from './MembersEmails.svelte'
	import { globalEvents } from '$lib/globalEvents'
	import { page } from '$app/stores'
	import MemberProfileForm from '$lib/member/MemberProfileForm.svelte'

	let { data } = $props()

	// Les colonnes non triviales se rendent par snippet: Svelte les déclare avant le corps du
	// script, elles sont donc lisibles ici.
	const cellSnippets = {
		member: memberCell,
		subscribesTeams: subscribesTeamsCell,
		subscribesCountRequest: subscribesCountRequestCell,
		subscribesHours: subscribesHoursCell,
	}

	// Recalculé à la main par `handleFieldCreated`: c'est de l'état, pas un dérivé.
	let tableFields = $state(
		untrack(() => getMembersTableFields(data.teams, data.fields, cellSnippets))
	)

	onMount(() => {
		globalEvents.on('field_created', handleFieldCreated)
		return () => {
			globalEvents.off('field_created', handleFieldCreated)
		}
	})

	let createSubscribeDialog: HTMLDialogElement = $state()!
	let selectedMember: Member | undefined = $state(undefined)

	async function handleFieldCreated(field: Field) {
		const url = new URL($page.url)
		const PARAM_VISIBLE_KEY = 'members_fields_visible'
		const fieldsVisible = jsonParse<string[]>(url.searchParams.get(PARAM_VISIBLE_KEY), [])
		fieldsVisible.push(`field_${field.id}`)
		url.searchParams.set(PARAM_VISIBLE_KEY, JSON.stringify(fieldsVisible))
		url.searchParams.delete('form_field')
		await goto(url, { noScroll: true, keepFocus: true, invalidateAll: true })
		tableFields = getMembersTableFields(data.teams, data.fields, cellSnippets)
	}
</script>

{#snippet memberCell(member: MemberWithComputedValue)}
	<MemberCell {member} />
{/snippet}

{#snippet subscribesTeamsCell(member: MemberWithComputedValue)}
	{@const { accepted, request } = getSubscribedTeams(member, data.teams)}
	{#each accepted as name (name)}
		<Badge content={name} />
	{/each}
	{#each request as name (name)}
		<Badge content={name} class="badge-warning badge-outline" />
	{/each}
{/snippet}

{#snippet subscribesCountRequestCell(member: MemberWithComputedValue)}
	{#if member.subscribesCountRequest}
		<Badge content={member.subscribesCountRequest.toString()} class="badge-warning badge-outline" />
	{:else}
		-
	{/if}
{/snippet}

{#snippet subscribesHoursCell(member: MemberWithComputedValue)}
	{#if member.workTimeRequest}
		<div class="flex items-center">
			<span>{msToHours(member.workTime)}</span>
			<span class="opacity-80 ml-1 text-warning text-xs">
				+{msToHours(member.workTimeRequest)}
			</span>
		</div>
	{:else}
		{msToHours(member.workTime)}
	{/if}
{/snippet}

<div class="flex gap-4 items-start">
	<Card class="grow min-w-0" bodyClass="sm:px-2 sm:py-2">
		<div class="flex flex-col gap-2">
			<div class="flex gap-x-2 gap-y-2 flex-wrap">
				<InputSearch class="max-w-43.75" />
				<MembersFilter />

				<div class="grow"></div>

				<!-- SHOW MEMBERS STATS -->
				<a href={urlParam.with({ members_stats: 1 })} class="btn btn-square btn-sm xl:hidden">
					<span class="inline-flex" use:tip={{ content: 'Afficher le résumé des membres' }}
						><SigmaIcon size={18} /></span
					>
				</a>

				<!-- RESET FILTER -->
				<a
					href={urlParam.without(...tableFields.map((f) => f.key), 'skip', 'take')}
					class="btn btn-square btn-sm"
				>
					<span class="inline-flex" use:tip={{ content: 'Effacer les filtres' }}
						><FilterXIcon size={18} /></span
					>
				</a>

				<TableViewSelect key="members" views={data.views} />

				<MembersExport />
				<MembersBadges badges={data.badges} />
				<MembersEmails />

				<a
					type="button"
					class="btn btn-square btn-sm"
					href={urlParam.with({ form_invite: '{}' })}
					data-sveltekit-noscroll
					data-sveltekit-replacestate
				>
					<span class="inline-flex" use:tip={{ content: 'Inviter des membres' }}
						><UserPlusIcon /></span
					>
				</a>
			</div>
			{#key tableFields}
				<Table
					key="members"
					items={data.members}
					fields={tableFields}
					placholder="Aucun membre trouvé"
					onCreateField={() => goto(urlParam.with({ form_field: '{}' }))}
				>
					{#snippet actions(member)}
						<MemberActions
							{member}
							onSubscribeDialog={async () => {
								selectedMember = member
								await tick()
								createSubscribeDialog.showModal()
							}}
						/>
					{/snippet}
				</Table>
			{/key}

			<div class="flex justify-end">
				<Pagination />
			</div>
		</div>
	</Card>

	<Card class="hidden xl:block max-w-xs" bodyClass="sm:px-2 sm:py-2">
		<MembersStats {data} />
	</Card>
</div>

{#if selectedMember}
	<MemberCreateSubscribeDialog
		bind:dialog={createSubscribeDialog}
		memberId={selectedMember.id}
		title="Nouvelle inscription pour {selectedMember.firstName}"
	/>
{/if}

<Drawer title="Résumé des membres" key="members_stats" class="xl:hidden" classBody="p-4 pb-10">
	<MembersStats {data} />
</Drawer>

<Drawer
	title="Modifier le profil de {data.memberProfile?.firstName}"
	key="form_member_profile"
	classBody="pt-4"
>
	{#snippet children({ close })}
		{#if data.memberProfile}
			<MemberProfileForm memberProfile={data.memberProfile} onsuccess={() => close()} />
		{/if}
	{/snippet}
</Drawer>
