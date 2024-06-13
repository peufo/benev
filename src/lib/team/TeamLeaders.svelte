<script lang="ts">
	import {
		mdiAlertOutline,
		mdiEmailOutline,
		mdiPhoneOutline,
		mdiShieldAccountOutline,
	} from '@mdi/js'
	import { Icon, DropDown, tip } from 'fuma'
	import { Avatar } from '$lib/me'
	import type { MemberWithUser } from '$lib/server'
	export let leaders: MemberWithUser[]
</script>

{#each leaders as member}
	<DropDown>
		<button
			slot="activator"
			class="hover:bg-base-200 bg-base-200/40 cursor-pointer flex gap-2 border items-center pr-2 rounded"
		>
			<Avatar user={member.user} class="h-8 w-8 rounded border" />
			<span class="text-sm">
				{member.user.firstName}
				{member.user.lastName}
			</span>
		</button>
		{#if member.isValidedByUser}
			<ul class="w-48">
				<li>
					<a class="menu-item" href="mailto:{member.user.email}" target="_blank">
						<Icon path={mdiEmailOutline} />
						Envoyer un mail
					</a>
				</li>
				{#if member.user.phone}
					<li>
						<a class="menu-item" href="tel:{member.user.phone}" target="_blank">
							<Icon path={mdiPhoneOutline} />
							Téléphoner
						</a>
					</li>
				{/if}
			</ul>
		{:else}
			<div class="px-3 py-1 flex gap-2">
				<Icon path={mdiAlertOutline} class="fill-warning" />
				<span>{member.user.firstName} n'a pas confirmé sa participation</span>
			</div>
		{/if}
	</DropDown>
{:else}
	<div class="text-error text-sm">Pas de responsable</div>
{/each}
