<script lang="ts">
	import { mdiEmailOutline, mdiPhoneOutline, mdiShieldAccountOutline } from '@mdi/js'
	import { Icon, DropDown, tip } from 'fuma'
	import type { Member } from '@prisma/client'
	export let leaders: (Member & {
		user: { firstName: string; lastName: string; email: string; phone: string | null }
	})[]
</script>

{#each leaders as member}
	{#if member.isValidedByUser}
		<DropDown>
			<button
				slot="activator"
				class="badge hover:bg-base-200 cursor-pointer"
				use:tip={{ content: `${member.user.firstName} est responsable de ce secteur` }}
			>
				<Icon path={mdiShieldAccountOutline} size={16} />
				<span class="ml-1">
					{member.user.firstName}
					{member.user.lastName}
				</span>
			</button>

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
		</DropDown>
	{:else}
		<button
			use:tip={{ content: "Ce responsable n'a pas confirmé sa participation" }}
			class="badge badge-outline badge-warning"
		>
			<Icon path={mdiShieldAccountOutline} size={16} />
			<span class="ml-1">
				{member.user.firstName}
				{member.user.lastName}
			</span>
		</button>
	{/if}
{:else}
	<div class="text-error">Pas de responsable</div>
{/each}
