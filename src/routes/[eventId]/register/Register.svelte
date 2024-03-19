<script lang="ts">
	import { page } from '$app/stores'
	import { afterNavigate, goto, invalidateAll } from '$app/navigation'
	import { mdiChevronLeft, mdiChevronRight, mdiClose } from '@mdi/js'
	import type { Event, Field, User, Page } from '@prisma/client'

	import { Card, Dialog, Icon, Placeholder } from '$lib/material'
	import { MemberDeleteForm, MemberForm, MemberProfileForm } from '$lib/member'
	import AvatarForm from '$lib/me/AvatarForm.svelte'
	import Login from '$lib/me/Login.svelte'
	import AccountForm from '$lib/me/AccountForm.svelte'
	import type { MemberProfile } from '$lib/server'
	import { urlParam } from '$lib/store'
	import { slide } from 'svelte/transition'

	export let event: Event & { memberFields: Field[] }
	export let user: User | undefined
	export let member: MemberProfile | undefined
	export let charter: Page | null

	const steps = ['Connexion', 'Adhésion', 'Mon compte']
	const isMemberProfileRequired = !!event.memberFields.filter((f) => f.memberCanWrite).length
	if (isMemberProfileRequired) steps.push(`Profil ${event.name}`)

	let dialogRemoveMember: HTMLDialogElement
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
		if (!isMemberProfileRequired || !member.isUserProfileCompleted) return 2
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
			(!isMemberProfileRequired || member.isMemberProfileCompleted) &&
			(!forcedStepIndex || forcedStepIndex === stepIndexMax)

		if (registerIsDone) {
			const redirectTo = $page.url.searchParams.get('redirectTo')
			await goto(redirectTo || `/${event.id}/me`)
			return
		}

		if (forcedStepIndex) {
			await goto($urlParam.with({ forcedStepIndex: stepIndex + 1 }))
			return
		}
	}
</script>

<Card class="max-w-2xl mx-auto" bodyClass="flex flex-col gap-6">
	<div class="flex items-center gap-2 mb-4">
		<h1 class="title">Participer à {event.name}</h1>
		<div class="join ml-auto border">
			<a
				href={$urlParam.with({ forcedStepIndex: stepIndex - 1 })}
				class="btn btn-sm btn-square join-item btn-ghost btn-disabled"
				class:btn-disabled={stepIndex <= 1}
			>
				<Icon
					title="Précédent"
					path={mdiChevronLeft}
					class={stepIndex <= 1 ? 'opacity-20' : 'opacity-70'}
				/>
			</a>

			<a
				href={$urlParam.with({ forcedStepIndex: stepIndex + 1 })}
				class="btn btn-sm btn-square join-item btn-ghost"
				class:btn-disabled={stepIndex >= stepIndexMax}
			>
				<Icon
					title="Suivant"
					path={mdiChevronRight}
					class={stepIndex >= stepIndexMax ? 'opacity-20' : 'opacity-70'}
				/>
			</a>
		</div>
		{#if !!member}
			<button
				type="button"
				class="btn btn-square btn-sm"
				transition:slide={{ axis: 'x' }}
				on:click={() => dialogRemoveMember.showModal()}
			>
				<Icon path={mdiClose} title="Annuler et supprimer ma participation" />
			</button>
		{/if}
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

	<div class="divider" />

	<div>
		{#if stepIndex === 0}
			<Login />
		{:else if !event.selfRegisterAllowed && !member?.isValidedByEvent}
			<Placeholder class="border text-center bg-base-100/90">
				<h2 class="text-lg">Invitation requise</h2>
				<p>
					Tu dois être invité par un responsable pour pouvoir devenir membre de cette évènement.
				</p>
			</Placeholder>
		{:else if stepIndex === 1 && user}
			<MemberForm userId={user.id} {event} {charter} on:success={onSucces} />
		{:else if stepIndex === 2 && user}
			<AvatarForm {user} on:success={onSucces} />
			<AccountForm {user} on:success={onSucces} />
		{:else if stepIndex === 3 && member}
			<MemberProfileForm writeOnly {member} on:success={onSucces} />
		{/if}
	</div>
</Card>

{#if member}
	<Dialog bind:dialog={dialogRemoveMember}>
		<h2 slot="header" class="title">On abandonne ?</h2>
		<div class="flex gap-2 justify-end">
			<MemberDeleteForm memberId={member.id}>Supprimer ma participation</MemberDeleteForm>
			<button type="button" class="btn" on:click={() => dialogRemoveMember.close()}>
				Je reste
			</button>
		</div>
	</Dialog>
{/if}
