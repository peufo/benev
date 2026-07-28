<script lang="ts">
	import { createBubbler, stopPropagation } from 'svelte/legacy'

	const bubble = createBubbler()
	import { mdiEmailOutline, mdiPhone, mdiClipboardTextOutline, mdiPencilOutline } from '@mdi/js'
	import { Icon } from '$lib/fuma-legacy'
	import { urlParam } from 'fuma'
	import type { Member } from '@prisma/client'

	interface Props {
		member: Member
		onSubscribeDialog?: (() => void) | undefined
	}

	let { member, onSubscribeDialog = undefined }: Props = $props()
</script>

<div class="flex gap-1 justify-end fill-base-content">
	{#if member.phone}
		<a
			href="tel:{member.phone}"
			target="_blank"
			class="btn btn-square btn-sm btn-ghost relative"
			onclick={stopPropagation(bubble('click'))}
		>
			<Icon
				path={mdiPhone}
				size={18}
				title="Téléphoner à {member.firstName} [{member.phone}]"
				tippyProps={{ appendTo: 'parent' }}
				class="fill-base-content/60"
			/>
		</a>
	{/if}
	{#if member.email}
		<a
			href="mailto:{member.email}"
			target="_blank"
			class="btn btn-square btn-sm btn-ghost relative"
			onclick={stopPropagation(bubble('click'))}
		>
			<Icon
				path={mdiEmailOutline}
				size={18}
				title="Envoyer un mail à {member.firstName} [{member.email}]"
				tippyProps={{ appendTo: 'parent' }}
				class="fill-base-content/60"
			/>
		</a>
	{/if}
	{#if onSubscribeDialog}
		<button type="button" class="btn btn-square btn-sm btn-ghost" onclick={onSubscribeDialog}>
			<Icon
				path={mdiClipboardTextOutline}
				size={20}
				title="Inscrire {member.firstName} à un secteur"
				class="fill-base-content/60"
			/>
		</button>
	{/if}

	<a
		href={urlParam.with({ form_member_profile: member.id })}
		class="btn btn-sm btn-square btn-ghost"
		data-sveltekit-replacestate
		data-sveltekit-noscroll
	>
		<Icon path={mdiPencilOutline} title="Modifier le profil" class="fill-base-content/60" />
	</a>
</div>
