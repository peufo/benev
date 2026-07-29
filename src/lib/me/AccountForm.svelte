<script lang="ts">
	import { mdiAlertOctagonOutline, mdiCheck } from '@mdi/js'
	import { Icon } from '$lib/fuma-legacy'
	import { InputString } from 'fuma'
	import { page } from '$app/state'
	import { toast } from 'svelte-sonner'
	import type { User } from '@prisma/client'
	import { sendEmailVerification, updateAccount } from './user.remote'

	interface Props {
		user: User
		/** Remplacent les évènements de la version Svelte 4. */
		onsuccess?: () => void
	}

	let { user, onsuccess }: Props = $props()

	let verificationEmailSent = $state(false)
	const verificationEmailMessage = 'Un email de verification à été envoyé'

	// Les champs manquants relevés par l'évènement sont désormais renvoyés par la remote
	// function elle-même (via `invalid`), au lieu d'être posés à la main au montage.
	let requiredFields = $derived(page.data.member?.userProfileRequiredFields ?? [])

	function getEmailError(): string {
		if (!page.data.event?.userEmailVerifiedRequired) return ''
		if (user.isEmailVerified) return ''
		return "Validation de l'email requise"
	}
	let emailError = $derived(getEmailError())
</script>

<form
	id="verify_email"
	{...sendEmailVerification.enhance(async ({ submit }) => {
		await submit()
		verificationEmailSent = true
		toast.success(verificationEmailMessage)
	})}
></form>

<form
	{...updateAccount.enhance(async ({ submit }) => {
		await submit()
		toast.success('Profil sauvegardé')
		onsuccess?.()
	})}
	class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4"
>
	{#if page.data.event?.id}
		<input type="hidden" name="eventId" value={page.data.event.id} />
	{/if}

	<div class="md:col-span-6">
		<span class="label-text">Email</span>
		<div class="join w-full">
			<input
				value={user.email}
				type="text"
				name="email"
				id="email"
				class="input join-item grow"
				inputmode="email"
			/>

			{#if user.isEmailVerified}
				<div class="btn-square join-item grid place-content-center bg-base-200">
					<Icon path={mdiCheck} class="fill-success" title="Votre email a été verifié" />
				</div>
			{:else}
				<button
					form="verify_email"
					class="btn btn-square join-item"
					disabled={verificationEmailSent}
				>
					<Icon path={mdiAlertOctagonOutline} class="fill-warning" title="Valide ton email" />
				</button>
			{/if}
		</div>
		{#if verificationEmailSent}
			<span class="label-text-alt">{verificationEmailMessage}</span>
		{:else if emailError}
			<span class="label-text-alt text-warning">{emailError}</span>
		{/if}
		{#each updateAccount.fields.email.issues() ?? [] as issue (issue.message)}
			<span class="label-text-alt text-error">{issue.message}</span>
		{/each}
	</div>

	<InputString
		field={updateAccount.fields.phone}
		label="Téléphone"
		defaultValue={user.phone || ''}
		class="md:col-span-6"
		inputmode="tel"
	/>

	<InputString
		field={updateAccount.fields.firstName}
		label="Prénom"
		defaultValue={user.firstName}
		class="md:col-span-4"
	/>
	<InputString
		field={updateAccount.fields.lastName}
		label="Nom de famille"
		defaultValue={user.lastName}
		class="md:col-span-4"
	/>
	<InputString
		field={updateAccount.fields.birthday}
		type="date"
		label="Date de naissance"
		defaultValue={user.birthday?.toISOString().slice(0, 10) ?? ''}
		class="md:col-span-4"
	/>

	<InputString
		field={updateAccount.fields.street}
		label="Rue et numéro"
		defaultValue={user.street || ''}
		class="md:col-span-4"
	/>
	<InputString
		field={updateAccount.fields.zipCode}
		label="Code postal"
		defaultValue={user.zipCode || ''}
		class="md:col-span-4"
	/>
	<InputString
		field={updateAccount.fields.city}
		label="Localité"
		defaultValue={user.city || ''}
		class="md:col-span-4"
	/>

	{#if requiredFields.length}
		<p class="col-span-full text-sm text-warning">
			Champs requis par l'évènement: {requiredFields.join(', ')}
		</p>
	{/if}

	<div class="flex gap-1 items-center justify-end col-span-full">
		<button class="btn btn-primary">Sauvegarder </button>
	</div>
</form>
