<script lang="ts">
	import { tip } from 'fuma'
	import { daytz } from '$lib/dayjs'
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
				<div class="flex gap-1 items-center ml-auto">
					<MemberProfileStatus {member} hideLabel />
					<span
						class="text-xs text-base-content/70 whitespace-nowrap"
						use:tip={{ content: daytz(member.createdAt).format('DD.MM.YYYY HH:mm') }}
					>
						{daytz(member.createdAt).fromNow()}
					</span>
				</div>
			</li>
		{/each}
	</ul>
{/if}
