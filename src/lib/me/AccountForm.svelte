<script lang="ts">
	import { CheckIcon, TriangleAlertIcon } from '@lucide/svelte'
	import { InputString, tip } from 'fuma'
	import { page } from '$app/state'
	import type { User } from '@prisma/client'
	import { enhanceForm } from '$lib/enhanceForm'
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
	{...sendEmailVerification.enhance(
		enhanceForm({
			success: verificationEmailMessage,
			onsuccess: () => (verificationEmailSent = true),
		})
	)}
></form>

<form
	{...updateAccount.enhance(
		enhanceForm({ success: 'Profil sauvegardé', onsuccess: () => onsuccess?.() })
	)}
	class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 md:grid-cols-12"
>
	{#if page.data.event?.id}
		<input type="hidden" name="eventId" value={page.data.event.id} />
	{/if}

	<fieldset class="fieldset md:col-span-6">
		<label class="label" for="account_email">Email</label>
		<div class="join w-full">
			<div class="input w-full">
				<input
					{...updateAccount.fields.email.as('text', user.email)}
					id="account_email"
					inputmode="email"
				/>
				{#if user.isEmailVerified}
					<CheckIcon size={18} class="text-success" />
				{/if}
			</div>

			{#if !user.isEmailVerified}
				<button
					form="verify_email"
					class="btn join-item btn-square"
					disabled={verificationEmailSent}
					use:tip={{ content: 'Envoyer un email de vérification' }}
				>
					<TriangleAlertIcon size={18} class="text-warning" />
					<span class="sr-only">Envoyer un email de vérification</span>
				</button>
			{/if}
		</div>
		{#if !user.isEmailVerified}
			<span class="label text-warning">Email non verifié</span>
		{/if}
		{#if verificationEmailSent}
			<span class="label">{verificationEmailMessage}</span>
		{:else if emailError}
			<span class="label text-warning">{emailError}</span>
		{/if}
		{#each updateAccount.fields.email.issues() ?? [] as issue (issue.message)}
			<span class="label text-error">{issue.message}</span>
		{/each}
	</fieldset>

	<InputString
		field={updateAccount.fields.phone}
		label="Téléphone"
		variant="block"
		value={user.phone || ''}
		class="md:col-span-6"
		inputmode="tel"
	/>

	<InputString
		field={updateAccount.fields.firstName}
		label="Prénom"
		variant="block"
		value={user.firstName}
		class="md:col-span-4"
	/>
	<InputString
		field={updateAccount.fields.lastName}
		label="Nom de famille"
		variant="block"
		value={user.lastName}
		class="md:col-span-4"
	/>
	<InputString
		field={updateAccount.fields.birthday}
		type="date"
		label="Date de naissance"
		variant="block"
		value={user.birthday?.toISOString().slice(0, 10) ?? ''}
		class="md:col-span-4"
	/>

	<InputString
		field={updateAccount.fields.street}
		label="Rue et numéro"
		variant="block"
		value={user.street || ''}
		class="md:col-span-4"
	/>
	<InputString
		field={updateAccount.fields.zipCode}
		label="Code postal"
		variant="block"
		value={user.zipCode || ''}
		class="md:col-span-4"
	/>
	<InputString
		field={updateAccount.fields.city}
		label="Localité"
		variant="block"
		value={user.city || ''}
		class="md:col-span-4"
	/>

	{#if requiredFields.length}
		<p class="col-span-full text-sm text-warning">
			Champs requis par l'évènement: {requiredFields.join(', ')}
		</p>
	{/if}

	<div class="col-span-full mt-2 flex items-center justify-end gap-1">
		<button class="btn btn-primary">Sauvegarder</button>
	</div>
</form>
