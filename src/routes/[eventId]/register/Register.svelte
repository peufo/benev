<script lang="ts">
	import type { ResolvedPathname } from '$app/types'
	import { ChevronLeftIcon, ChevronRightIcon, XIcon } from '@lucide/svelte'
	import { page } from '$app/stores'
	import { afterNavigate, goto, invalidateAll } from '$app/navigation'
	import { eventPath } from '$lib/eventPath'

	import { Card, Placeholder } from '$lib/ui'
	import { Dialog, tip } from 'fuma'
	import { urlParam } from 'fuma'
	import { MemberDeleteForm, MemberForm, MemberProfileForm, memberIsRegistered } from '$lib/member'
	import { Login, AvatarForm, AccountForm } from '$lib/me'
	import { slide } from 'svelte/transition'
	import type { PageData } from './$types'

	let { event, user, member, memberToClaim, charter }: PageData = $props()

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
		// `member` est la fiche reliée au compte: sans elle, l'adhésion reste à faire.
		if (!member) return 1
		if (!isMemberProfileRequired || !member.isUserProfileCompleted) return 2
		return 3
	}

	async function onSucces() {
		await invalidateAll()
		stepIndex = getStepIndex($page.url)

		// Le même prédicat que les gardes qui renvoient ici: s'ils divergeaient, le tunnel se
		// croirait fini et la page d'arrivée le relancerait aussitôt.
		const registerIsDone =
			!!user && memberIsRegistered(member) && (!forcedStepIndex || forcedStepIndex === stepIndexMax)

		if (registerIsDone) {
			// Le paramètre vient de l'URL: son chemin est déjà résolu.
			const redirectTo = $page.url.searchParams.get('redirectTo') as ResolvedPathname | null
			await goto(redirectTo || eventPath('/me'))
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
		<div class="join ml-auto border border-soft rounded-field">
			<a
				href={urlParam.with({ forcedStepIndex: stepIndex - 1 })}
				class="btn btn-sm btn-square join-item btn-ghost btn-disabled"
				class:btn-disabled={stepIndex <= 1}
				use:tip={{ content: 'Précédent' }}
			>
				<ChevronLeftIcon class="opacity-70" />
			</a>

			<a
				href={urlParam.with({ forcedStepIndex: stepIndex + 1 })}
				class="btn btn-sm btn-square join-item btn-ghost"
				class:btn-disabled={stepIndex >= stepIndexMax}
				use:tip={{ content: 'Suivant' }}
			>
				<ChevronRightIcon class="opacity-70" />
			</a>
		</div>
		{#if !!member}
			<button
				type="button"
				class="btn btn-square btn-sm"
				transition:slide={{ axis: 'x' }}
				onclick={() => dialogRemoveMember.showModal()}
				use:tip={{ content: 'Annuler et supprimer ma participation' }}
			>
				<XIcon />
			</button>
		{/if}
	</div>

	<ul class="steps">
		{#each steps as step, index (step)}
			<li class="step text-sm" class:step-primary={stepIndex >= index}>
				<a
					href={urlParam.with({ forcedStepIndex: index })}
					class={['btn btn-xs btn-ghost', index === 0 && 'btn-disabled']}
				>
					{step}
				</a>
			</li>
		{/each}
	</ul>

	<div class="divider"></div>

	<div>
		{#if stepIndex === 0}
			<Login onSuccess={() => document.location.reload()} />
		{:else if !event.selfRegisterAllowed && !(member ?? memberToClaim)?.isValidedByEvent}
			<Placeholder class="border text-center bg-base-100/90">
				<h2 class="text-lg">Invitation requise</h2>
				<p>
					Tu dois être invité·e par un responsable pour pouvoir devenir membre de cet évènement.
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
