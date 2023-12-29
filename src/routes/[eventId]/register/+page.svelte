<script lang="ts">
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import { Card, Placeholder } from '$lib/material'
	import { MemberForm, MemberProfileForm } from '$lib/member'
	import AvatarForm from '$lib/me/AvatarForm.svelte'
	import Login from '$lib/me/Login.svelte'
	import ProfileForm from '$lib/me/ProfileForm.svelte'

	export let data

	const steps = ['Connexion', 'Adhérer', 'Profil de base', `Profil ${data.event.name}`]

	function handleMemberProfilFormSuccess() {
		const redirectTo = $page.url.searchParams.get('redirectTo')
		goto(redirectTo || `/${data.event.id}/me`)
	}
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
	{:else if !data.event.selfRegisterAllowed && !data.member?.isValidedByEvent}
		<Placeholder class="border text-center bg-base-100/90">
			<h2 class="text-lg">Invitation requise</h2>
			<p>Tu dois être invité par un responsable pour pouvoir devenir membre de cette évènement.</p>
		</Placeholder>
	{:else if !data.member?.isValidedByUser}
		<MemberForm userId={data.user.id} event={data.event} class="mx-auto" />
	{:else if !data.member.isUserProfileCompleted}
		<Card>
			<AvatarForm user={data.user} />
			<ProfileForm user={data.user} />
		</Card>
	{:else}
		<Card>
			<MemberProfileForm
				writeOnly
				member={data.member}
				on:success={handleMemberProfilFormSuccess}
				successUpdate={false}
			/>
		</Card>
	{/if}
</div>
