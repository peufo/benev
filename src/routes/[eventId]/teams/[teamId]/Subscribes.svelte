<script lang="ts">
	import type { PageData } from './$types'
	import { page } from '$app/stores'
	import type { User } from '@prisma/client'
	import { eventPath } from '$lib/store'
	import SubscribeStateForm from '$lib/SubscribeStateForm.svelte'
	import Contact from '$lib/Contact.svelte'

	// TODO: Pourquoi user ne passe pas directement dans le type ???
	export let subscribes: (PageData['team']['periods'][number]['subscribes'][number] & {
		member?: { user: User }
	})[]
</script>

<div class="flex flex-col gap-2">
	{#each subscribes as subscribe}
		<div class="flex gap-2 justify-end items-center">
			{#if subscribe.member}
				<a
					class="btn btn-sm"
					title="Voir les infos de {subscribe.member.user.firstName}"
					href="{$eventPath}/admin/members/{subscribe.memberId}"
				>
					{subscribe.member.user.firstName}
					{subscribe.member.user.lastName}
				</a>

				<Contact user={subscribe.member.user} />
			{/if}

			<SubscribeStateForm {subscribe} isLeader />
		</div>
	{:else}
		<div class="flex flex-end justify-center text-secondary">Aucune inscription pour l'instant</div>
	{/each}
</div>
