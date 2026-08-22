<script lang="ts">
	import { MailIcon, PhoneIcon } from '@lucide/svelte'
	import { tip } from 'fuma'
	import type { Member } from '@prisma/client'
	import MemberSubscribeButton from './MemberSubscribeButton.svelte'

	interface Props {
		member: Member
		onSubscribeDialog?: (() => void) | undefined
	}

	let { member, onSubscribeDialog = undefined }: Props = $props()
</script>

<div class="flex gap-1 justify-end text-base-content">
	{#if member.phone}
		<a
			href="tel:{member.phone}"
			target="_blank"
			class="btn btn-square btn-sm btn-ghost relative"
			use:tip={{ content: `Téléphoner à ${member.firstName} [${member.phone}]` }}
		>
			<PhoneIcon size={18} class="text-base-content/60" />
		</a>
	{/if}
	{#if member.email}
		<a
			href="mailto:{member.email}"
			target="_blank"
			class="btn btn-square btn-sm btn-ghost relative"
			use:tip={{ content: `Envoyer un mail à ${member.firstName} [${member.email}]` }}
		>
			<MailIcon size={18} class="text-base-content/60" />
		</a>
	{/if}
	{#if onSubscribeDialog}
		<MemberSubscribeButton {member} onclick={onSubscribeDialog} />
	{/if}
</div>
