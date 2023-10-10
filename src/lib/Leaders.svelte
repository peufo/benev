<script lang="ts">
	import { mdiEmailOutline, mdiPhoneOutline, mdiShieldAccount } from '@mdi/js'
	import { Icon, DropDown } from '$lib/material'
	import { tip } from '$lib/action'
	import type { Member } from '@prisma/client'
	export let leaders: (Member & {
		user: { firstName: string; lastName: string; email: string; phone: string | null }
	})[]
</script>

<div class="flex items-center gap-2">
	<Icon
		path={mdiShieldAccount}
		class="btn-sm btn-square opacity-70 {leaders.length ? '' : 'fill-error'}"
		title="Responsables"
	/>

	<div class="flex flex-wrap gap-1">
		{#each leaders as member}
			{#if member.isValidedByUser}
				<DropDown>
					<button slot="activator" class="badge badge-lg hover:bg-base-200 cursor-pointer">
						{member.user.firstName}
						{member.user.lastName}
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
				<button use:tip={{ content: "Ce membre n'a pas validé sa participation" }} class="badge badge-lg badge-outline badge-warning">
					{member.user.firstName}
					{member.user.lastName}
				</button>
			{/if}
		{:else}
			<div class="text-error pt-1">Pas de responsable</div>
		{/each}

	</div>

</div>
