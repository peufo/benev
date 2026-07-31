<script lang="ts">
	import { MailIcon, PhoneIcon, TriangleAlertIcon } from '@lucide/svelte'
	import type { Member } from '@prisma/client'
	import { DropDown } from 'fuma'
	import { Avatar } from '$lib/me'
	interface Props {
		leaders: Member[]
	}

	let { leaders }: Props = $props()
</script>

{#each leaders as member (member.id)}
	<DropDown>
		{#snippet activator()}
			<button
				class="hover:bg-base-200 bg-base-200/40 cursor-pointer flex gap-2 border items-center pr-2 rounded"
			>
				<Avatar
					firstName={member.firstName}
					avatarId={member.avatarId}
					avatarPlaceholder={member.avatarPlaceholder}
					class="h-8 w-8 rounded border"
				/>
				<span class="text-sm">
					{member.firstName}
					{member.lastName}
				</span>
			</button>
		{/snippet}
		{#if member.isValidedByUser}
			<ul class="w-48">
				<li>
					<a class="menu-item" href="mailto:{member.email}" target="_blank">
						<MailIcon />
						Envoyer un mail
					</a>
				</li>
				{#if member.phone}
					<li>
						<a class="menu-item" href="tel:{member.phone}" target="_blank">
							<PhoneIcon />
							Téléphoner
						</a>
					</li>
				{/if}
			</ul>
		{:else}
			<div class="px-3 py-1 flex gap-2">
				<TriangleAlertIcon class="text-warning" />
				<span>{member.firstName} n'a pas confirmé sa participation</span>
			</div>
		{/if}
	</DropDown>
{:else}
	<div class="text-error text-sm">Pas de responsable</div>
{/each}
