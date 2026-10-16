<script lang="ts">
	import { currentEventId } from '#lib/eventPath.js'
	import { UserPlusIcon } from '@lucide/svelte'
	import type { Member } from '@prisma/client'
	import { InputSelect, tip } from 'fuma'
	import { inviteCall } from '#lib/drawerCall.svelte.js'
	import { searchMembers } from '#lib/member/member.remote.js'
	import { createSubscribe } from './subscribe.remote'
	import { enhanceForm } from '#lib/enhanceForm.js'

	interface Props {
		periodId: string
		class?: string
		member?: Member | undefined
		/** Remplacent les évènements de la version Svelte 4. */
		onsuccess?: () => void
	}

	let { periodId, class: klass = '', member = $bindable(undefined), onsuccess }: Props = $props()
</script>

<form
	{...createSubscribe.enhance(
		enhanceForm({
			success: 'Inscription créée',
			onsuccess: () => {
				member = undefined
				onsuccess?.()
			},
		})
	)}
	class="{klass} flex gap-2 justify-end grow w-full"
>
	<input {...createSubscribe.fields.periodId.as('hidden', periodId)} />
	<InputSelect
		field={createSubscribe.fields.memberId}
		class="grow"
		placeholder="Inscrire un membre"
		items={({ search }) => searchMembers({ search, eventId: currentEventId() })}
		bind:value={member}
	>
		{#snippet selected(item)}
			<span>{item.firstName} {item.lastName}</span>
		{/snippet}

		{#snippet proposal(item)}
			<span>{item.firstName} {item.lastName}</span>
			<span class="ml-auto text-xs opacity-70">{item.email}</span>
		{/snippet}

		{#snippet append({ hide })}
			<!-- Sans `from`: rien ne boucle entre une période et une invitation, et le tiroir garde
			     donc son champ « Responsable des secteurs ». -->
			<a
				{...inviteCall.link({ oncreated: (invited) => (member = invited) }, { onclick: hide })}
				class="btn btn-square btn-soft btn-sm"
				use:tip={{ content: 'Inviter un nouveau membre' }}
			>
				<UserPlusIcon size={20} />
			</a>
		{/snippet}
	</InputSelect>

	{#if member}
		<button class="btn btn-primary"> Inscrire </button>
	{/if}
</form>
