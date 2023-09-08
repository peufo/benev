<script lang="ts">
	import { mdiEmailOutline, mdiPhoneOutline, mdiShieldAccount } from '@mdi/js'
	import { Icon } from '$lib/material'
	import { tip } from '$lib/action'
	import type { LayoutData } from './$types'
	export let leaders: LayoutData['team']['leaders']
</script>

<div class="flex flex-wrap gap-2">
	<Icon
		path={mdiShieldAccount}
		class="btn-sm btn-square opacity-70 {leaders.length ? '' : 'fill-error'}"
		title="Responsables"
	/>

	{#each leaders as member}
		{#if member.isValidedByUser}
			<div class="dropdown">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
				<label tabindex="0" class="btn btn-sm">
					{member.user.firstName}
					{member.user.lastName}
				</label>
				<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
				<ul
					tabindex="0"
					class="dropdown-content menu z-10 p-2 shadow-lg rounded-box bg-base-100 w-48"
				>
					<li>
						<a href="mailto:{member.user.email}" target="_blank">
							<Icon path={mdiEmailOutline} />
							Envoyer un mail
						</a>
					</li>
					{#if member.user.phone}
						<li>
							<a href="tel:{member.user.phone}" target="_blank">
								<Icon path={mdiPhoneOutline} />
								Téléphoner
							</a>
						</li>
					{/if}
				</ul>
			</div>
		{:else}
			<div use:tip={{ content: "Ce membre n'a pas validé sa participation" }}>
				<button class="btn btn-sm btn-disabled">
					{member.user.firstName}
					{member.user.lastName}
				</button>
			</div>
		{/if}
	{:else}
		<div class="text-error pt-1">Pas de responsable</div>
	{/each}
</div>
