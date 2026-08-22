<script lang="ts">
	import { tip } from 'fuma'
	import dayjs from '$lib/dayjs'
	import { MemberCell, MemberProfileStatus } from '$lib/member'
	import { Placeholder } from '$lib/ui'
	import type { PageData } from './$types'

	let { members }: { members: PageData['lastMembers'] } = $props()
</script>

{#if !members.length}
	<Placeholder>Personne n'a encore rejoint l'évènement</Placeholder>
{:else}
	<ul class="flex flex-col">
		{#each members as member (member.id)}
			<li class="flex items-center flex-wrap gap-2 py-1 border-b border-soft last:border-0">
				<MemberCell {member} />
				<div class="grow"></div>
				<MemberProfileStatus {member} />
				<span
					class="text-xs text-base-content/70 whitespace-nowrap"
					use:tip={{ content: dayjs(member.createdAt).format('DD.MM.YYYY HH:mm') }}
				>
					{dayjs(member.createdAt).fromNow()}
				</span>
			</li>
		{/each}
	</ul>
{/if}
