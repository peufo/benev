<script lang="ts">
	import { ChevronLeftIcon, ChevronRightIcon, XIcon } from '@lucide/svelte'
	import { page } from '$app/stores'
	import { afterNavigate, goto, invalidateAll } from '$app/navigation'
	import type { Event, Field, User, Page } from '@prisma/client'

	import { Card, Placeholder } from '$lib/ui'
	import { Dialog, tip } from 'fuma'
	import { urlParam } from 'fuma'
	import { MemberDeleteForm, MemberForm, MemberProfileForm } from '$lib/member'
	import { Login, AvatarForm, AccountForm } from '$lib/me'
	import type { MemberProfile } from '$lib/server'
	import { slide } from 'svelte/transition'

	interface Props {
		event: Event & { memberFields: Field[] }
		user: User | undefined
		member: MemberProfile | undefined
		charter: Page | null
	}

	let { event, user, member, charter }: Props = $props()

	const isMemberProfileRequired = $derived(
		!!event.memberFields.filter((f) => f.memberCanWrite).length
	)
	const steps = $derived([
		'Connexion',
		'Adhésion',
		'Mon compte',
		...(isMemberProfileRequired ? [`Profil ${event.name}`] : []),
	])

	let dialogRemoveMember: HTMLDialogElement = $state()!
	let forcedStepIndex = 0
	let stepIndexMax = $state(getStepIndexMax())
	let stepIndex = $state(getStepIndex($page.url))
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
			await goto(urlParam.with({ forcedStepIndex: stepIndex + 1 }))
			return
		}
	}
</script>

<Card class="max-w-2xl mx-auto" bodyClass="flex flex-col gap-6">
	<div class="flex items-center gap-2 mb-4">
		<h1 class="title">Participer à {event.name}</h1>
		<div class="join ml-auto border">
			<a
				href={urlParam.with({ forcedStepIndex: stepIndex - 1 })}
				class="btn btn-sm btn-square join-item btn-ghost btn-disabled"
				class:btn-disabled={stepIndex <= 1}
			>
				<span class="inline-flex" use:tip={{ content: 'Précédent' }}
					><ChevronLeftIcon class={stepIndex <= 1 ? 'opacity-20' : 'opacity-70'} /></span
				>
			</a>

			<a
				href={urlParam.with({ forcedStepIndex: stepIndex + 1 })}
				class="btn btn-sm btn-square join-item btn-ghost"
				class:btn-disabled={stepIndex >= stepIndexMax}
			>
				<span class="inline-flex" use:tip={{ content: 'Suivant' }}
					><ChevronRightIcon
						class={stepIndex >= stepIndexMax ? 'opacity-20' : 'opacity-70'}
					/></span
				>
			</a>
		</div>
		{#if !!member}
			<button
				type="button"
				class="btn btn-square btn-sm"
				transition:slide={{ axis: 'x' }}
				onclick={() => dialogRemoveMember.showModal()}
			>
				<span class="inline-flex" use:tip={{ content: 'Annuler et supprimer ma participation' }}
					><XIcon /></span
				>
			</button>
		{/if}
	</div>

	<ul class="steps">
		{#each steps as step, index (step)}
			<li class="step text-sm" class:step-primary={stepIndex >= index}>
				<a href={urlParam.with({ forcedStepIndex: index })} class:btn-disabled={index === 0}>
					{step}
				</a>
			</li>
		{/each}
	</ul>

	<div class="divider"></div>

	<div>
		{#if stepIndex === 0}
			<Login onSuccess={() => document.location.reload()} />
		{:else if !event.selfRegisterAllowed && !member?.isValidedByEvent}
			<Placeholder class="border text-center bg-base-100/90">
				<h2 class="text-lg">Invitation requise</h2>
				<p>
					Tu dois être invité par un responsable pour pouvoir devenir membre de cette évènement.
				</p>
			</Placeholder>
		{:else if stepIndex === 1 && user}
			<MemberForm {event} {charter} onsuccess={onSucces} />
		{:else if stepIndex === 2 && user}
			<AvatarForm {user} onsuccess={onSucces} />
			<AccountForm {user} onsuccess={onSucces} />
		{:else if stepIndex === 3 && member}
			<MemberProfileForm memberProfile={member} onsuccess={onSucces} />
		{/if}
	</div>
</Card>

{#if member}
	<Dialog bind:dialog={dialogRemoveMember}>
		{#snippet header()}
			<h2 class="title">On abandonne ?</h2>
		{/snippet}
		<div class="flex gap-2 justify-end">
			<MemberDeleteForm memberId={member.id}>Supprimer ma participation</MemberDeleteForm>
			<button type="button" class="btn" onclick={() => dialogRemoveMember.close()}>
				Je reste
			</button>
		</div>
	</Dialog>
{/if}
