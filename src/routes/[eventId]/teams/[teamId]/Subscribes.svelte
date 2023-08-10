<script lang="ts">
	import { slide } from 'svelte/transition'
	import type { PageData } from './$types'
	import type { User } from '@prisma/client'
	import { Icon } from '$lib/material'
	import { mdiEmailOutline, mdiPhone } from '@mdi/js'
	import { eventPath } from '$lib/store'
	import SubscribeStateForm from './SubscribeStateForm.svelte'

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
								href="{$eventPath}/admin/users/{subscribe.userId}"
							>
								{subscribe.user.firstName}
								{subscribe.user.lastName}
							</a>
							<a class="btn btn-square btn-sm" href="tel:{subscribe.user.phone}" target="_blank">
								<Icon path={mdiPhone} size={18} title="Appeler {subscribe.user.firstName}" />
							</a>
							<a class="btn btn-square btn-sm" href="mailto:{subscribe.user.email}" target="_blank">
								<Icon
									path={mdiEmailOutline}
									size={18}
									title="Contater {subscribe.user.firstName} par mail"
								/>
							</a>
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
