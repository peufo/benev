<script lang="ts">
	import { tip } from 'fuma'
	import { daytz } from '$lib/dayjs'
	import { MemberCell, MemberProfileStatus } from '$lib/member'
	import { Placeholder } from '$lib/ui'
	import type { PageData } from './$types'
	import type { MembersView } from './membersView'

	interface Props {
		members: PageData['members']
		view: MembersView
	}

	let { members, view }: Props = $props()

	const emptyLabels = {
		last: "Personne n'a encore rejoint l'évènement",
		without: 'Tous les membres ont au moins une inscription',
	} satisfies Record<MembersView, string>
</script>

{#if !members.length}
	<Placeholder>{emptyLabels[view]}</Placeholder>
{:else}
	<ul class="flex flex-col">
		{#each members as member (member.id)}
			<li class="flex items-center flex-wrap gap-2 py-1 border-b border-soft last:border-0">
				<MemberCell {member} />
				<span
					class="text-xs text-base-content/70 whitespace-nowrap"
					use:tip={{ content: daytz(member.createdAt).format('DD.MM.YYYY HH:mm') }}
				>
					{daytz(member.createdAt).fromNow()}
				</span>
				<div class="flex gap-1 items-center ml-auto">
					<MemberProfileStatus {member} noBadge />
				</div>
			</li>
		{/each}
	</ul>
{/if}
