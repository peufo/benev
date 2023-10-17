<script lang="ts">
	import type { PageData } from '../routes/[eventId]/teams/[teamId]/$types'
	import type { User } from '@prisma/client'
	import { eventPath } from '$lib/store'
	import SubscribeStateForm from '$lib/SubscribeStateForm.svelte'
	import Contact from '$lib/Contact.svelte'
	import SubscribeCreatedBy from '$lib/SubscribeCreatedBy.svelte'

	// TODO: Pourquoi user ne passe pas directement dans le type ???
	export let subscribes: (PageData['team']['periods'][number]['subscribes'][number] & {
		member?: { user: User }
	})[]
</script>

<div class="flex flex-col gap-1 items-end">
	{#each subscribes as subscribe}
		<div class="flex flex-wrap gap-1 justify-end items-center">
			{#if subscribe.member}
				<a
					class="badge badge-lg whitespace-nowrap hover:bg-base-200"
					title="Voir les infos de {subscribe.member.user.firstName}"
					href="{$eventPath}/admin/members/{subscribe.memberId}"
				>
					{subscribe.member.user.firstName}
					{subscribe.member.user.lastName}
				</a>
			{/if}

			<SubscribeCreatedBy createdBy={subscribe.createdBy} size={20} class="mr-auto" />

			{#if subscribe.member}
				<Contact user={subscribe.member.user} />
			{/if}

			<SubscribeStateForm {subscribe} isLeader on:success />
		</div>
	{:else}
		<div class="flex flex-end justify-center text-secondary px-4 py-2 opacity-70">
			Pas d'inscription pour l'instant
		</div>
	{/each}
</div>
