<script lang="ts">
	import { tip } from 'fuma'
	import dayjs from '$lib/dayjs'
	import { formatRange } from '$lib/formatRange'
	import { MemberCell } from '$lib/member'
	import { eventPath } from '$lib/store'
	import { SubscribeCreatedBy, SubscribeStateForm } from '$lib/subscribe'
	import { Placeholder } from '$lib/ui'
	import type { PageData } from './$types'
	import type { Waiting } from './waiting'

	interface Props {
		subscribes: PageData['toValidate']
		/** Absent: les deux camps sont listés ensemble. */
		waiting?: Waiting
	}

	let { subscribes, waiting }: Props = $props()

	const emptyLabels = {
		us: 'Aucune demande à trancher',
		member: 'Aucune proposition sans réponse',
	} satisfies Record<Waiting, string>
</script>

{#if !subscribes.length}
	<Placeholder>
		{waiting ? emptyLabels[waiting] : 'Aucune inscription en attente'}
	</Placeholder>
{:else}
	<ul class="flex flex-col">
		{#each subscribes as subscribe (subscribe.id)}
			<li class="flex items-center flex-wrap gap-2 py-1 border-b border-soft last:border-0">
				<MemberCell member={subscribe.member} />
				<div class="flex gap-2 ml-auto items-center">
					<a
						href="{$eventPath}/teams?section={subscribe.period.teamId}"
						class="link link-hover text-sm"
					>
						{subscribe.period.team.name}
					</a>
					<span
						class="text-xs text-base-content/70 whitespace-nowrap"
						use:tip={{ content: `Demandé ${dayjs(subscribe.createdAt).fromNow()}` }}
					>
						{formatRange(subscribe.period)}
					</span>
					<!-- Les deux camps mêlés, il faut lire sur la ligne qui attend qui. Filtrée, la
						 liste le dit déjà par son bouton. -->
					{#if !waiting}
						<SubscribeCreatedBy createdBy={subscribe.createdBy} size={18} />
					{/if}
					<SubscribeStateForm {subscribe} isLeader />
				</div>
			</li>
		{/each}
	</ul>
{/if}
