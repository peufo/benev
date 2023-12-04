<script lang="ts">
	import MemberForm from '$lib/MemberForm.svelte'
	import { Card } from '$lib/material'
	import AvatarForm from '$lib/me/AvatarForm.svelte'
	import Login from '$lib/me/Login.svelte'
	import ProfileForm from '$lib/me/ProfileForm.svelte'
	import { MemberProfileForm } from '$lib/member'

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
	{:else if !data.member.isUserProfileCompleted}
		<Card>
			<div class="flex items-end gap-2">
				<AvatarForm user={data.user} />
				{#if data.member.userProfileRequiredFields.includes('avatarId')}
					<span class="text-xs text-warning">Photo de profil requise</span>
				{/if}
			</div>
			<ProfileForm user={data.user} />
		</Card>
	{:else}
		<Card>
			<MemberProfileForm member={data.member} />
		</Card>
	{/if}
</div>
