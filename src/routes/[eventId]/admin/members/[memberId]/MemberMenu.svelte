<script lang="ts">
	import { Popover, tip } from 'fuma'
	import type { PageData } from './$types'
	import { MemberDeleteForm, MemberRole } from '$lib/member'
	import { CheckIcon, Trash2Icon, XIcon } from '@lucide/svelte'
	import MemberIsValidedByEventForm from './MemberIsValidedByEventForm.svelte'
	import MemberIsAdminForm from './MemberIsAdminForm.svelte'
	import { eventPath } from '$lib/store'

	let { data }: { data: PageData } = $props()
</script>

<Popover placement="bottom-end" listenFocus={false} class="p-1 my-1">
	{#snippet trigger({ trigger })}
		<button
			type="button"
			class="btn btn-sm whitespace-nowrap"
			{...trigger}
			use:tip={{
				content: data.memberProfile.isValidedByEvent
					? "Membre approuvé par l'organisation"
					: "Membre non approuvé par l'organisation",
			}}
		>
			<MemberRole roles={data.memberProfile.roles} mode="contents" />
			{#if data.memberProfile.isValidedByEvent}
				<CheckIcon class="text-success" />
			{:else}
				<XIcon class="text-error" />
			{/if}
		</button>
	{/snippet}

	{#snippet children({ hide })}
		<div class="flex flex-col w-max">
			<MemberIsValidedByEventForm memberProfile={data.memberProfile} onsuccess={hide} />

			{#if data.member?.roles.includes('owner')}
				<MemberIsAdminForm memberProfile={data.memberProfile} onsuccess={hide} />
			{/if}

			<MemberDeleteForm
				memberId={data.memberProfile.id}
				redirectTo="{$eventPath}/admin/members"
				btn={false}
				class="menu-item w-full"
			>
				{#snippet children({ waitConfirmation })}
					<Trash2Icon size={20} class="text-error" />
					<span class={waitConfirmation ? 'text-error font-semibold' : ''}>
						{waitConfirmation ? 'Confirmer ?' : 'Supprimer le membre'}
					</span>
				{/snippet}
			</MemberDeleteForm>
		</div>
	{/snippet}
</Popover>
