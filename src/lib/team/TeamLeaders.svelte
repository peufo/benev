<script lang="ts">
	import type { Member } from '@prisma/client'
	import { mdiAlertOutline, mdiEmailOutline, mdiPhoneOutline } from '@mdi/js'
	import { Icon, DropDown } from 'fuma'
	import { Avatar } from '$lib/me'
	export let leaders: Member[]
</script>

{#each leaders as member}
	<DropDown>
		<button
			slot="activator"
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
		{#if member.isValidedByUser}
			<ul class="w-48">
				<li>
					<a class="menu-item" href="mailto:{member.email}" target="_blank">
						<Icon path={mdiEmailOutline} />
						Envoyer un mail
					</a>
				</li>
				{#if member.phone}
					<li>
						<a class="menu-item" href="tel:{member.phone}" target="_blank">
							<Icon path={mdiPhoneOutline} />
							Téléphoner
						</a>
					</li>
				{/if}
			</ul>
		{:else}
			<div class="px-3 py-1 flex gap-2">
				<Icon path={mdiAlertOutline} class="fill-warning" />
				<span>{member.firstName} n'a pas confirmé sa participation</span>
			</div>
		{/if}
	</DropDown>
{:else}
	<div class="text-error text-sm">Pas de responsable</div>
{/each}
