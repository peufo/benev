<script lang="ts">
	import { slide } from 'svelte/transition'
	import type { PageData } from './$types'
	import type { User } from '@prisma/client'
	import { eventPath } from '$lib/store'
	import SubscribeStateForm from '$lib/SubscribeStateForm.svelte'
	import Contact from '$lib/Contact.svelte'

	// TODO: Pourquoi user ne passe pas directement dans le type ???
	export let subscribes: (PageData['periods'][number]['subscribes'][number] & { user?: User })[]
	export let isOpen = false
</script>

<tr class:border-0={!isOpen}>
	<td class="py-0" colspan="3">
		{#if isOpen}
			<div class="py-3 pl-6" transition:slide>
				{#each subscribes as subscribe}
					<div class="flex gap-2 justify-end items-center py-1">
						{#if subscribe.user}
							<a
								class="btn btn-sm"
								title="Voir les infos de {subscribe.user.firstName}"
								href="{$eventPath}/admin/members/{subscribe.memberId}"
							>
								{subscribe.user.firstName}
								{subscribe.user.lastName}
							</a>

							<Contact user={subscribe.user} />
						{/if}

						<SubscribeStateForm {subscribe} />
					</div>
				{:else}
					<div class="flex flex-end justify-center text-secondary">
						Aucune inscription pour l'instant
					</div>
				{/each}
			</div>
		{/if}
	</td>
</tr>
