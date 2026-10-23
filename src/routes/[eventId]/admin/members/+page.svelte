<script lang="ts">
	import { FunnelXIcon, UploadIcon, SigmaIcon, UserPlusIcon } from '@lucide/svelte'
	import type { Field, Member } from '@prisma/client'
	import { onMount, tick, untrack } from 'svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import { eventPath } from '#lib/eventPath.js'
	import { InputSearch, Surface, Badge } from '#lib/ui/index.js'
	import TableViewSelect from '#lib/view/TableViewSelect.svelte'
	import { Drawer, tip } from 'fuma'
	import { Pagination } from 'fuma'
	import { Table } from 'fuma'
	import { urlParam } from 'fuma'
	import { jsonParse } from 'fuma'
	import { MemberActions, MemberCell, MemberCreateSubscribeDialog } from '#lib/member/index.js'
	import { getMembersTableFields, getSubscribedTeams } from './membersTableFields'
	import { msToHours } from './msToHours'
	import type { MemberWithComputedValue } from './getMembers.server'
	import MembersExport from './MembersExport.svelte'
	import MembersFilter from './MembersFilter.svelte'
	import MembersBadges from './MembersBadges.svelte'
	import MembersStats from './MembersStats.svelte'
	import MembersEmails from './MembersEmails.svelte'
	import { globalEvents } from '#lib/globalEvents.js'

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

	// Les responsables lisent aussi cette page, mais l'import lit les membres d'un autre évènement.
	// Le root non plus: l'import a besoin d'un membre pour signer le journal et les invitations.
	const isAdmin = $derived(!!page.data.member?.roles.includes('admin'))

	let createSubscribeDialog: HTMLDialogElement = $state()!
	let selectedMember: Member | undefined = $state(undefined)

	async function handleFieldCreated(field: Field) {
		const PARAM_VISIBLE_KEY = 'members_fields_visible'
		const fieldsVisible = jsonParse<string[]>(urlParam.get(PARAM_VISIBLE_KEY), [])
		fieldsVisible.push(`field_${field.id}`)
		const url = urlParam.with({ [PARAM_VISIBLE_KEY]: JSON.stringify(fieldsVisible) }, 'form_field')
		await goto(url, { reset: false, refreshAll: true })
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

<div class="flex gap-3 items-start">
	<Surface class="grow min-w-0">
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
					<span class="inline-flex" use:tip={{ content: 'Effacer les filtres' }}>
						<FunnelXIcon size={18} />
					</span>
				</a>

				<TableViewSelect key="members" views={data.views} ignoredKeys={['members_stats']} />

				<MembersBadges badges={data.badges} />
				<MembersEmails />
				<MembersExport />

				{#if isAdmin}
					<a
						href={eventPath('/admin/members/import')}
						class="btn btn-square btn-sm"
						aria-label="Importer des membres"
						use:tip={{ content: 'Importer des membres' }}
					>
						<UploadIcon size={18} />
					</a>
				{/if}

				<a
					type="button"
					class="btn btn-square btn-sm btn-secondary"
					href={urlParam.with({ form_invite: '{}' })}
					data-sveltekit-reset="false"
					data-sveltekit-replacestate
					use:tip={{ content: 'Inviter des membres' }}
				>
					<UserPlusIcon size={20} />
				</a>
			</div>
			{#key tableFields}
				<Table
					key="members"
					items={data.members}
					fields={tableFields}
					placholder="Aucun membre trouvé"
					onCreateField={() => goto(urlParam.with({ form_field: '{}' }))}
					class="border-hard"
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
	</Surface>

	<div class="hidden xl:block surface p-2">
		<MembersStats {data} />
	</div>
</div>

{#if selectedMember}
	<MemberCreateSubscribeDialog
		bind:dialog={createSubscribeDialog}
		memberId={selectedMember.id}
		title="Nouvelle inscription pour {selectedMember.firstName}"
	/>
{/if}

<Drawer
	title="Résumé des membres"
	key="members_stats"
	class="surface-drawer xl:hidden"
	classBody="p-4 pb-10"
>
	<MembersStats {data} />
</Drawer>
