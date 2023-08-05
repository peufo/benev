<script lang="ts">
	import { slide } from 'svelte/transition'
	import type { PageData } from './$types'
	import type { User } from '@prisma/client'
	import { Icon } from '$lib/material'
	import SubscribeState from './SubscribeState.svelte'
	import { mdiEmailOutline, mdiPhone } from '@mdi/js'
	import { eventPath } from '$lib/store'

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
								href="{$eventPath}/users/{subscribe.userId}"
							>
								{subscribe.user.firstName}
								{subscribe.user.lastName}
							</a>
							<a class="btn btn-square btn-sm" href="tel:{subscribe.user.phone}">
								<Icon path={mdiPhone} size={18} title="Appeler {subscribe.user.firstName}" />
							</a>
							<a class="btn btn-square btn-sm" href="tel:{subscribe.user.phone}">
								<Icon
									path={mdiEmailOutline}
									size={18}
									title="Contater {subscribe.user.firstName} par mail"
								/>
							</a>
						{/if}
						<div>
							<SubscribeState state={subscribe.state} class="p-1" />
						</div>
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
