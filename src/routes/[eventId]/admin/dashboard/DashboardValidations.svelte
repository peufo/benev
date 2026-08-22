<script lang="ts">
	import { tip } from 'fuma'
	import dayjs from '$lib/dayjs'
	import { formatRange } from '$lib/formatRange'
	import { MemberCell } from '$lib/member'
	import { eventPath } from '$lib/store'
	import { SubscribeStateForm } from '$lib/subscribe'
	import { Placeholder } from '$lib/ui'
	import type { PageData } from './$types'
	import type { Waiting } from './waiting'

	let { subscribes, waiting }: { subscribes: PageData['toValidate']; waiting: Waiting } = $props()
</script>

{#if !subscribes.length}
	<Placeholder>
		{waiting === 'us' ? 'Aucune demande à trancher' : 'Aucune proposition sans réponse'}
	</Placeholder>
{:else}
	<ul class="flex flex-col">
		{#each subscribes as subscribe (subscribe.id)}
			<li class="flex items-center flex-wrap gap-2 py-1 border-b border-soft last:border-0">
				<MemberCell member={subscribe.member} />
				<div class="grow"></div>
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
				<SubscribeStateForm {subscribe} isLeader />
			</li>
		{/each}
	</ul>
{/if}
