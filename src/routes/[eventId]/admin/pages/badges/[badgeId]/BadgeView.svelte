<script lang="ts">
	import { untrack } from 'svelte'

	import { InputSelect } from 'fuma'
	import type { PageData } from './$types'
	import type { Member } from '@prisma/client'
	import { searchMembers } from '$lib/member/member.remote'
	import { eventPath } from '$lib/eventPath'
	import { fade } from 'svelte/transition'

	interface Props {
		badge: PageData['badge']
		defaultMember: Member | undefined
	}

	let { badge, defaultMember }: Props = $props()

	// Membre affiché en aperçu: `defaultMember` n'en est que la valeur de départ.
	let member: Member | undefined = $state(untrack(() => defaultMember))

	let clientWidth: number = $state()!
	let clientHeight: number = $state()!

	// Le PDF est rendu par le serveur: seul un enregistrement peut le changer, et c'est le
	// formulaire qui sait quand il en a réussi un.
	let refreshKey = $state({})
	export function refresh() {
		refreshKey = {}
	}
</script>

<div class="flex flex-col gap-4">
	<InputSelect
		label="Aperçu du badge de"
		placeholder="Choisir un membre pour l'aperçu"
		bind:value={member}
		items={searchMembers}
	>
		{#snippet selected(item)}
			{@const badgeType = item.profileJson[badge.typeFieldId || '']}
			<span class="flex gap-2">
				<span>{item.firstName} {item.lastName}</span>
				{#if badgeType}
					<span class="ml-auto mr-3 italic opacity-70">{badgeType}</span>
				{/if}
			</span>
		{/snippet}
		{#snippet proposal(item)}
			{@const badgeType = item.profileJson[badge.typeFieldId || '']}
			<span>{item.firstName} {item.lastName}</span>
			{#if badgeType}
				<span class="ml-auto italic opacity-70">{badgeType}</span>
			{/if}
		{/snippet}
	</InputSelect>

	{#if member}
		<!-- L'`<object>` veut des dimensions en pixels: le conteneur les lui donne, et sa
		     hauteur doit donc être posée plutôt que déduite de son contenu. -->
		<div class="h-128 overflow-hidden rounded-lg" bind:clientWidth bind:clientHeight>
			{#key refreshKey}
				<object
					in:fade
					title="Aperçu du badge"
					data={eventPath(`/admin/pages/badges/[badgeId]/pdf?memberId=${member.id}`, {
						badgeId: badge.id,
					})}
					type="application/pdf"
					width={clientWidth}
					height={clientHeight}
				></object>
			{/key}
		</div>
	{/if}
</div>
