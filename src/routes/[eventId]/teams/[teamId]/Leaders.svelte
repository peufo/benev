<script lang="ts">
	import { mdiEmailOutline, mdiPhoneOutline, mdiShieldAccount } from '@mdi/js'
	import { Member, User } from '@prisma/client'
	import { Icon } from '$lib/material'

	export let leaders: (Member & { user: User })[]
</script>

<div class="flex gap-2">
	<Icon
		path={mdiShieldAccount}
		class="opacity-70 {leaders.length ? '' : 'fill-error'}"
		title="Responsables"
	/>

	{#each leaders as { user }}
		<div class="dropdown">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<label tabindex="0" class="btn btn-sm">{user.firstName} {user.lastName}</label>
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<ul
				tabindex="0"
				class="dropdown-content menu z-10 p-2 shadow-lg rounded-box bg-base-100 w-48"
			>
				<li>
					<a href="mailto:{user.email}" target="_blank">
						<Icon path={mdiEmailOutline} />
						Envoyer un mail
					</a>
				</li>
				{#if user.phone}
					<li>
						<a href="tel:{user.phone}" target="_blank">
							<Icon path={mdiPhoneOutline} />
							Téléphoner
						</a>
					</li>
				{/if}
			</ul>
		</div>
	{:else}
		<span class="text-error">Pas de responsable</span>
	{/each}
</div>
