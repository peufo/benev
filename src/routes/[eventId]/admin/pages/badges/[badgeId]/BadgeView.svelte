<script lang="ts">
	import { InputRelation } from 'fuma'
	import type { PageData } from './$types'
	import type { Member } from '@prisma/client'
	import { api } from '$lib/api'
	import { eventPath } from '$lib/store'
	import { debounce } from '$lib/debounce'
	import { fade } from 'svelte/transition'

	export let badge: PageData['badge']
	export let defaultMember: Member | undefined

	let member: Member | undefined = defaultMember

	let clientWidth: number
	let clientHeight: number

	let refreshKey = {}
	const refresh = debounce(() => {
		refreshKey = {}
	}, 400)
	$: if (badge) refresh()
</script>

<div class="grow flex flex-col gap-4 h-auto max-w-sm">
	<InputRelation
		label="Aperçu du badge de"
		placeholder="Choisir un membre pour l'aperçu"
		bind:value={member}
		search={$api.member.search}
	>
		<div slot="item" let:item class="flex gap-2">
			{@const badgeType = item?.profileJson[badge.typeFieldId || '']}
			<span>{item?.firstName} {item?.lastName}</span>
			{#if badgeType}
				<span class="ml-auto mr-3 italic opacity-70">{badgeType}</span>
			{/if}
		</div>
		<div slot="suggestion" let:item class="flex gap-2 w-full">
			{@const badgeType = item?.profileJson[badge.typeFieldId || '']}
			<span>{item?.firstName} {item?.lastName}</span>
			{#if badgeType}
				<span class="ml-auto mr-3 italic opacity-70">{badgeType}</span>
			{/if}
		</div>
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
				/>
			{/key}
		</div>
	{/if}
</div>
