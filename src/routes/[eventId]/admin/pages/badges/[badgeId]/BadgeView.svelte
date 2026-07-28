<script lang="ts">
	import { run } from 'svelte/legacy'

	import { InputRelation } from '$lib/fuma'
	import type { PageData } from './$types'
	import type { Member } from '@prisma/client'
	import { api } from '$lib/api'
	import { eventPath } from '$lib/store'
	import { debounce } from '$lib/debounce'
	import { fade } from 'svelte/transition'
	import { browser } from '$app/environment'

	interface Props {
		badge: PageData['badge']
		defaultMember: Member | undefined
	}

	let { badge, defaultMember }: Props = $props()

	let member: Member | undefined = $state(defaultMember)

	let clientWidth: number = $state()
	let clientHeight: number = $state()

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
	run(() => {
		if (badge) refresh()
	})
</script>

<div class="grow flex flex-col gap-4 h-auto max-w-sm">
	<InputRelation
		label="Aperçu du badge de"
		placeholder="Choisir un membre pour l'aperçu"
		bind:value={member}
		search={$api.member.search}
	>
		{#snippet item({ item })}
			{@const badgeType = item?.profileJson[badge.typeFieldId || '']}
			<div class="flex gap-2">
				<span>{item?.firstName} {item?.lastName}</span>
				{#if badgeType}
					<span class="ml-auto mr-3 italic opacity-70">{badgeType}</span>
				{/if}
			</div>
		{/snippet}
		{#snippet suggestion({ item })}
			{@const badgeType = item?.profileJson[badge.typeFieldId || '']}
			<div class="flex gap-2 w-full">
				<span>{item?.firstName} {item?.lastName}</span>
				{#if badgeType}
					<span class="ml-auto mr-3 italic opacity-70">{badgeType}</span>
				{/if}
			</div>
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
