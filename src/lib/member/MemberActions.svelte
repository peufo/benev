<script lang="ts">
	import { ClipboardListIcon, MailIcon, PencilIcon, PhoneIcon } from '@lucide/svelte'
	import { createBubbler, stopPropagation } from 'svelte/legacy'

	const bubble = createBubbler()
	import { tip, urlParam } from 'fuma'
	import type { Member } from '@prisma/client'

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
			onclick={stopPropagation(bubble('click'))}
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
			onclick={stopPropagation(bubble('click'))}
			use:tip={{ content: `Envoyer un mail à ${member.firstName} [${member.email}]` }}
		>
			<MailIcon size={18} class="text-base-content/60" />
		</a>
	{/if}
	{#if onSubscribeDialog}
		<button type="button" class="btn btn-square btn-sm btn-ghost" onclick={onSubscribeDialog}>
			<span class="inline-flex" use:tip={{ content: `Inscrire ${member.firstName} à un secteur` }}
				><ClipboardListIcon size={20} class="text-base-content/60" /></span
			>
		</button>
	{/if}

	<a
		href={urlParam.with({ form_member_profile: member.id })}
		class="btn btn-sm btn-square btn-ghost"
		data-sveltekit-replacestate
		data-sveltekit-noscroll
	>
		<span class="inline-flex" use:tip={{ content: 'Modifier le profil' }}
			><PencilIcon class="text-base-content/60" /></span
		>
	</a>
</div>
