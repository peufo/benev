<script lang="ts">
	import { mdiArrowLeft } from '@mdi/js'
	import MemberForm from '$lib/MemberForm.svelte'
	import { Card, Icon, Placeholder } from '$lib/material'
	import AvatarForm from '$lib/me/AvatarForm.svelte'
	import Login from '$lib/me/Login.svelte'
	import ProfileForm from '$lib/me/ProfileForm.svelte'
	import { MemberProfileForm } from '$lib/member'

	export let data

	const steps = ['Connexion', 'Adhérer', 'Profil de base', `Profil ${data.event.name}`]
</script>

<div class="max-w-2xl mx-auto flex flex-col gap-4">
	<div class="flex gap-2 justify-between flex-wrap">
		<a href="/me" class="btn btn-sm btn-ghost">
			<Icon path={mdiArrowLeft} size={20} />
			Tous mes évènements
		</a>
	</div>

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
			<MemberProfileForm writeOnly member={data.member} />
		</Card>
	{/if}
</div>
