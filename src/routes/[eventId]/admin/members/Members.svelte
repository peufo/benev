<script lang="ts">
	import { goto } from '$app/navigation'
	import {mdiCheck, mdiClose} from '@mdi/js'
	import { eventPath } from '$lib/store'
	import { Placeholder, Icon } from '$lib/material'
	import Contact from '$lib/Contact.svelte'

	import type { PageData } from './$types'
	import type { Column } from '$lib/ColumnsSelect.svelte'
	import Avatar from '$lib/me/Avatar.svelte'
	import {MemberRole, MemberAbsences} from '$lib/member'


	type Member = PageData['members'][number]
	export let members: Member[]

	export let selectedColumnsId = ['periods', 'hours', 'sectors']
	export let columns: Record<string, Column<Member>>
</script>

<div class="table-wrapper">
	{#if members.length}
		<table class="table">
			<thead>
				<tr class="shadow">
					<th>Membre</th>
					{#each selectedColumnsId as colId}
						<th>{columns[colId].label}</th>
					{/each}
					<th />
				</tr>
			</thead>

			<tbody>
				{#each members as member (member.id)}
					<tr
						on:click={() => goto(`${$eventPath}/admin/members/${member.id}`)}
						class="hover cursor-pointer group"
					>
						<td>
							<div class="flex gap-2 items-center">
								<Avatar user={member.user} class="h-8 w-8 rounded border" />
								<span class="whitespace-nowrap">
									{member.user.firstName}
									{member.user.lastName}
								</span>
								<MemberRole roles={member.roles} mode="icon" />
								<MemberAbsences subscribes={member.subscribes} />
							</div>
						</td>

						{#each selectedColumnsId as colId}
							{@const value = columns[colId].getValue(member)}
							<td>
								{#if Array.isArray(value)}
									{#each value as v}
										<span class="badge badge-sm mr-1 whitespace-nowrap">
											{v}
										</span>
									{/each}
								{:else if typeof value === 'number'}
									<span class="badge">{value}</span>
								{:else if value === true}
									<Icon path={mdiCheck} class="fill-success"/>
								{:else if value === false}
									<Icon path={mdiClose} class="fill-error"/>
								{:else}
									<span>{value}</span>
								{/if}
							</td>
						{/each}

						<td align="right">
							<Contact user={{ ...member.user }} />
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<Placeholder>Aucun membre trouvé</Placeholder>
	{/if}
</div>
