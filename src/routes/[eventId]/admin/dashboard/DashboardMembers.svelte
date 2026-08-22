<script lang="ts">
	import { tick } from 'svelte'
	import { tip } from 'fuma'
	import { daytz } from '$lib/dayjs'
	import {
		MemberCell,
		MemberCreateSubscribeDialog,
		MemberProfileStatus,
		MemberSubscribeButton,
	} from '$lib/member'
	import { Placeholder } from '$lib/ui'
	import type { PageData } from './$types'
	import type { MembersView } from './membersView'

	interface Props {
		members: PageData['members']
		view: MembersView
	}

	let { members, view }: Props = $props()

	// Un seul dialogue pour toute la liste, comme dans la table des membres: il se rouvre sur
	// le membre choisi plutôt que d'exister six fois.
	let createSubscribeDialog: HTMLDialogElement = $state()!
	let selectedMember: PageData['members'][number] | undefined = $state(undefined)

	async function handleSubscribeDialog(member: PageData['members'][number]) {
		selectedMember = member
		await tick()
		createSubscribeDialog.showModal()
	}

	const emptyLabels = {
		last: "Personne n'a encore rejoint l'évènement",
		without: 'Tous les membres ont au moins une inscription',
	} satisfies Record<MembersView, string>
</script>

{#if !members.length}
	<Placeholder>{emptyLabels[view]}</Placeholder>
{:else}
	<ul class="flex flex-col">
		{#each members as member (member.id)}
			<li class="flex items-center flex-wrap gap-2 py-1 border-b border-soft last:border-0">
				<MemberCell {member} />
				<span
					class="text-xs text-base-content/70 whitespace-nowrap"
					use:tip={{ content: daytz(member.createdAt).format('DD.MM.YYYY HH:mm') }}
				>
					{daytz(member.createdAt).fromNow()}
				</span>
				<div class="flex gap-1 items-center ml-auto">
					<MemberProfileStatus {member} noBadge />
					<MemberSubscribeButton {member} onclick={() => handleSubscribeDialog(member)} />
				</div>
			</li>
		{/each}
	</ul>
{/if}

{#if selectedMember}
	<MemberCreateSubscribeDialog
		bind:dialog={createSubscribeDialog}
		memberId={selectedMember.id}
		title="Nouvelle inscription pour {selectedMember.firstName}"
	/>
{/if}
