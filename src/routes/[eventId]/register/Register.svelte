<script lang="ts">
	import { page } from '$app/stores'
	import { afterNavigate, goto, invalidateAll } from '$app/navigation'
	import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'
	import { Card, Icon, Placeholder } from '$lib/material'
	import { MemberForm, MemberProfileForm } from '$lib/member'
	import AvatarForm from '$lib/me/AvatarForm.svelte'
	import Login from '$lib/me/Login.svelte'
	import AccountForm from '$lib/me/AccountForm.svelte'
	import type { Event, Field, User } from '@prisma/client'
	import type { MemberProfile } from '$lib/server'
	import { urlParam } from '$lib/store'

	export let event: Event & { memberFields: Field[] }
	export let user: User | undefined
	export let member: MemberProfile | undefined

	const steps = ['Connexion', 'Adhérer', 'Mon compte']
	const isMemberProfileRequired = !!event.memberFields.filter((f) => f.memberCanWrite).length
	if (isMemberProfileRequired) steps.push(`Profil ${event.name}`)

	let forcedStepIndex = 0
	let stepIndexMax = getStepIndexMax()
	let stepIndex = getStepIndex($page.url)
	afterNavigate(({ to }) => {
		stepIndex = getStepIndex(to?.url)
	})

	function getStepIndex(url?: URL): number {
		forcedStepIndex = Number(url?.searchParams.get('forcedStepIndex') || 0)
		stepIndexMax = getStepIndexMax()
		if (forcedStepIndex && forcedStepIndex <= stepIndexMax) return forcedStepIndex
		return stepIndexMax
	}

	function getStepIndexMax() {
		if (!user) return 0
		if (!member || !member.isValidedByUser) return 1
		if (!member.isUserProfileCompleted) return 2
		return 3
	}

	async function onSucces() {
		await invalidateAll()
		stepIndex = getStepIndex($page.url)

		const registerIsDone =
			!!user &&
			!!member &&
			member.isValidedByUser &&
			member.isUserProfileCompleted &&
			(!isMemberProfileRequired || member.isMemberProfileCompleted)

		if (registerIsDone) {
			const redirectTo = $page.url.searchParams.get('redirectTo')
			await goto(redirectTo || `/${event.id}/me`)
			return
		}

		if (forcedStepIndex) {
			console.log('asdasd', stepIndex, $urlParam.with({ forcedStepIndex: stepIndex + 1 }))
			await goto($urlParam.with({ forcedStepIndex: stepIndex + 1 }))
			return
		}
	}
</script>

<div class="max-w-2xl mx-auto flex flex-col gap-4">
	<Card>
		<div class="flex items-center gap-2 mb-4">
			<h1 class="title">Inscription à {event.name}</h1>
			<div class="join ml-auto border">
				<a
					href={$urlParam.with({ forcedStepIndex: stepIndex - 1 })}
					class="btn btn-sm join-item btn-ghost btn-disabled"
					class:btn-disabled={stepIndex <= 1}
				>
					Précédent
					<Icon path={mdiChevronLeft} class={stepIndex <= 1 ? 'opacity-20' : 'opacity-70'} />
				</a>

				<a
					href={$urlParam.with({ forcedStepIndex: stepIndex + 1 })}
					class="btn btn-sm join-item btn-ghost"
					class:btn-disabled={stepIndex >= stepIndexMax}
				>
					<Icon
						path={mdiChevronRight}
						class={stepIndex >= stepIndexMax ? 'opacity-20' : 'opacity-70'}
					/>
					Suivant
				</a>
			</div>
		</div>
		<ul class="steps">
			{#each steps as step, index}
				<li class="step text-sm" class:step-primary={stepIndex >= index}>
					<a href={$urlParam.with({ forcedStepIndex: index })} class:btn-disabled={index === 0}>
						{step}
					</a>
				</li>
			{/each}
		</ul>
	</Card>

	{#if stepIndex === 0}
		<Login />
	{:else if !event.selfRegisterAllowed && !member?.isValidedByEvent}
		<Placeholder class="border text-center bg-base-100/90">
			<h2 class="text-lg">Invitation requise</h2>
			<p>Tu dois être invité par un responsable pour pouvoir devenir membre de cette évènement.</p>
		</Placeholder>
	{:else if stepIndex === 1 && user}
		<MemberForm userId={user.id} {event} class="mx-auto" on:success={onSucces} />
	{:else if stepIndex === 2 && user}
		<Card>
			<AvatarForm {user} on:success={onSucces} />
			<AccountForm {user} on:success={onSucces} />
		</Card>
	{:else if stepIndex === 3 && member}
		<Card>
			<MemberProfileForm writeOnly {member} on:success={onSucces} />
		</Card>
	{/if}
</div>
