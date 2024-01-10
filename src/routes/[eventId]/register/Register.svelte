<script lang="ts">
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import { Card, Placeholder } from '$lib/material'
	import { MemberForm, MemberProfileForm } from '$lib/member'
	import AvatarForm from '$lib/me/AvatarForm.svelte'
	import Login from '$lib/me/Login.svelte'
	import AccountForm from '$lib/me/AccountForm.svelte'
	import type { Event, Field, User } from '@prisma/client'
	import type { MemberProfile } from '$lib/server'

	export let stepIndex: number
	export let event: Event & { memberFields: Field[] }
	export let user: User | undefined
	export let member: MemberProfile | undefined

	const steps = ['Connexion', 'Adhérer', 'Mon compte']
	const isMemberProfileRequired = !!event.memberFields.filter((f) => f.memberCanWrite).length

	if (isMemberProfileRequired) steps.push(`Profil ${event.name}`)

	$: if (!isMemberProfileRequired && stepIndex === 3) handleSuccess()

	function handleSuccess() {
		const redirectTo = $page.url.searchParams.get('redirectTo')
		goto(redirectTo || `/${event.id}/me`)
	}
</script>

<div class="max-w-2xl mx-auto flex flex-col gap-4">
	<Card>
		<ul class="steps">
			{#each steps as step, index}
				<li class="step text-sm" class:step-secondary={stepIndex >= index}>
					{step}
				</li>
			{/each}
		</ul>
	</Card>

	{#if !user}
		<Login />
	{:else if !event.selfRegisterAllowed && !member?.isValidedByEvent}
		<Placeholder class="border text-center bg-base-100/90">
			<h2 class="text-lg">Invitation requise</h2>
			<p>Tu dois être invité par un responsable pour pouvoir devenir membre de cette évènement.</p>
		</Placeholder>
	{:else if !member?.isValidedByUser}
		<MemberForm userId={user.id} {event} class="mx-auto" />
	{:else if !member.isUserProfileCompleted}
		<Card>
			<AvatarForm {user} />
			<AccountForm {user} />
		</Card>
	{:else}
		<Card>
			<MemberProfileForm writeOnly {member} on:success={handleSuccess} successUpdate={false} />
		</Card>
	{/if}
</div>
