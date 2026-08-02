<script lang="ts">
	import { untrack } from 'svelte'

	import { InputRelation } from 'fuma'
	import type { PageData } from './$types'
	import type { Member } from '@prisma/client'
	import { searchMembers } from '$lib/member/member.remote'
	import { eventPath } from '$lib/store'
	import { debounce } from '$lib/debounce'
	import { fade } from 'svelte/transition'
	import { browser } from '$app/environment'

	interface Props {
		badge: PageData['badge']
		defaultMember: Member | undefined
	}

	let { badge, defaultMember }: Props = $props()

	// Membre affiché en aperçu: `defaultMember` n'en est que la valeur de départ.
	let member: Member | undefined = $state(untrack(() => defaultMember))

	let clientWidth: number = $state()!
	let clientHeight: number = $state()!

	function useRefresh() {
		if (!browser) return () => {}
		let firstCall = true
		return debounce(() => {
			if (!firstCall) {
				refreshKey = {}
			}
			firstCall = false
		}, 400)
	}
	let refreshKey = $state({})
	const refresh = useRefresh()
	$effect.pre(() => {
		if (badge) refresh()
	})
</script>

<div class="grow flex flex-col gap-4 h-auto max-w-sm">
	<InputRelation
		label="Aperçu du badge de"
		placeholder="Choisir un membre pour l'aperçu"
		bind:value={member}
		searchItems={searchMembers}
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
	</InputRelation>

	{#if member}
		<div class="rounded-lg overflow-hidden grow" bind:clientWidth bind:clientHeight>
			{#key refreshKey}
				<object
					in:fade
					title="Aperçu du badge"
					data="{$eventPath}/admin/pages/badges/{badge.id}/pdf?memberId={member.id}"
					type="application/pdf"
					width={clientWidth}
					height={clientHeight}
				></object>
			{/key}
		</div>
	{/if}
</div>
