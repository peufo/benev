<script lang="ts">
	import { mdiAccountPlusOutline, mdiFilterRemoveOutline, mdiSigma } from '@mdi/js'
	import type { Field, Member } from '@prisma/client'
	import { onMount, tick } from 'svelte'
	import { Drawer, Icon, jsonParse, urlParam } from 'fuma'
	import { goto } from '$app/navigation'
	import { InputSearch, Pagination, Table, TableViewSelect, Card } from 'fuma'

	import { component } from '$lib/utils'
	import { MemberActions, MemberCreateSubscribeDialog } from '$lib/member'
	import { getMembersTableFields } from './membersTableFields'
	import MembersImport from './MembersImport.svelte'
	import MembersFilter from './MembersFilter.svelte'
	import MembersStats from './MembersStats.svelte'
	import MembersEmails from './MembersEmails.svelte'
	import { eventPath } from '$lib/store'
	import { globalEvents } from '$lib/globalEvents'
	import { page } from '$app/stores'
	import MemberProfileForm from '$lib/member/MemberProfileForm.svelte'

	export let data

	let tableFields = getMembersTableFields(data.teams, data.fields)

	onMount(() => {
		globalEvents.on('field_created', handleFieldCreated)
		return () => {
			globalEvents.off('field_created', handleFieldCreated)
		}
	})

	let createSubscribeDialog: HTMLDialogElement
	let selectedMember: (Member & { user: { firstName: string } }) | undefined = undefined

	async function handleFieldCreated(field: Field) {
		const url = new URL($page.url)
		const PARAM_VISIBLE_KEY = 'members_fields_visible'
		const fieldsVisible = jsonParse<string[]>(url.searchParams.get(PARAM_VISIBLE_KEY), [])
		fieldsVisible.push(`field_${field.id}`)
		url.searchParams.set(PARAM_VISIBLE_KEY, JSON.stringify(fieldsVisible))
		url.searchParams.delete('form_field')
		await goto(url, { noScroll: true, keepFocus: true, invalidateAll: true })
		tableFields = getMembersTableFields(data.teams, data.fields)
	}
</script>

<div class="flex gap-4 items-start">
	<Card class="grow min-w-0" bodyClass="sm:px-2 sm:py-2">
		<div class="flex flex-col gap-2">
			<div class="flex gap-x-2 gap-y-2 flex-wrap">
				<InputSearch class="max-w-[175px]" />
				<MembersFilter />

				<div class="grow" />

				<!-- SHOW MEMBERS STATS -->
				<a href={$urlParam.with({ members_stats: 1 })} class="btn btn-square btn-sm xl:hidden">
					<Icon path={mdiSigma} title="Afficher le résumé des membres" size={18} />
				</a>

				<!-- RESET FILTER -->
				<a
					href={$urlParam.without(...tableFields.map((f) => f.key), 'skip', 'take')}
					class="btn btn-square btn-sm"
				>
					<Icon path={mdiFilterRemoveOutline} title="Effacer les filtres" size={18} />
				</a>

				<TableViewSelect key="members" views={data.views} action="{$eventPath}/admin" />

				<MembersImport />
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
					onCreateField={() => goto($urlParam.with({ form_field: 1 }))}
				/>
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
		title="Nouvelle inscription pour {selectedMember.user.firstName}"
	/>
{/if}

<Drawer title="Résumé des membres" key="members_stats" class="xl:hidden" classBody="p-4 pb-10">
	<MembersStats {data} />
</Drawer>

<Drawer
	title="Modifier le profil de {data.memberProfile?.user.firstName}"
	key="form_member_profile"
	let:close
	classBody="pt-4"
>
	{#if data.memberProfile}
		<MemberProfileForm memberProfile={data.memberProfile} on:success={() => close()} />
	{/if}
</Drawer>
