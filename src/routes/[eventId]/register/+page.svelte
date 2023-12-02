<script lang="ts">
	import MemberForm from '$lib/MemberForm.svelte'
	import { Card } from '$lib/material'
	import Login from '$lib/me/Login.svelte'
	import ProfileForm from '$lib/me/ProfileForm.svelte'

	/**
	 * 1. Devenir membre
	 * 2. Profil de base complet en fonction des options ?
	 * 3. Profil complémentaire ?
	 * 4. Callback
	 */

	export let data

	const steps = ['Connexion', 'Adhérer', 'Profil de base', `Profil ${data.event.name}`]
</script>

<div class="max-w-2xl mx-auto flex flex-col gap-4">
	<Card>
		<ul class="steps">
			{#each steps as step, index}
				<li class="step text-sm" class:step-secondary={data.stepIndex >= index}>
					{step}
				</li>
			{/each}
		</ul>
	</Card>

	{#if !data.user}
		<Login />
	{:else if !data.member || !data.member.isValidedByUser}
		<MemberForm userId={data.user.id} event={data.event} class="mx-auto" />
	{:else}
		<Card>
			<ProfileForm user={data.user} />
		</Card>
	{/if}
</div>
