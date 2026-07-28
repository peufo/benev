<script lang="ts">
	import { mdiAlertOctagonOutline, mdiCheck } from '@mdi/js'
	import { onMount } from 'svelte'
	import { useForm, Icon, InputText, InputDate, FormControl } from '$lib/fuma-legacy'
	import { enhance } from '$app/forms'
	import { page } from '$app/stores'
	import type { User } from '@prisma/client'

	interface Props {
		user: User
		successReset?: boolean
		successUpdate?: boolean
		/** Remplacent les évènements de la version Svelte 4. */
		onsuccess?: () => void
	}

	let { user, successReset = false, successUpdate = false, onsuccess }: Props = $props()
	let emailError = getEmailError()
	const formProfile = useForm({
		successReset,
		successUpdate,
		successMessage: 'Profil sauvegardé',
		onSuccess() {
			onsuccess?.()
		},
	})

	let verificationEmailSent = $state(false)
	const verificationEmailMessage = 'Un email de verification à été envoyé'
	const formEmailVerification = useForm({
		successMessage: verificationEmailMessage,
		onSuccess() {
			verificationEmailSent = true
		},
	})

	onMount(() => {
		$page.data.member?.userProfileRequiredFields.forEach((key) => {
			formProfile.setError(key, 'Valeur manquante')
		})
	})

	function getEmailError(): string {
		if (!$page.data.event?.userEmailVerifiedRequired) return ''
		if (user.isEmailVerified) return ''
		return "Validation de l'email requise"
	}
</script>

<form
	id="verify_email"
	method="post"
	action="/me?/verify_email"
	use:enhance={formEmailVerification.submit}
></form>

<form
	method="post"
	action="/me?/account_update"
	use:enhance={formProfile.submit}
	class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4"
>
	{#if $page.data.event?.id}
		<input type="hidden" name="eventId" value={$page.data.event.id} />
	{/if}
	<FormControl
		key="email"
		label="Email"
		class="md:col-span-6"
		hint={verificationEmailSent ? verificationEmailMessage : ''}
	>
		<div class="join">
			<input
				value={user.email}
				type="text"
				name="email"
				id="email"
				class=" input join-item grow"
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
		{#if emailError}
			<div class="label">
				<span class="label-text-alt text-warning">{emailError}</span>
			</div>
		{/if}
	</FormControl>

	<InputText
		key="phone"
		label="Téléphone"
		value={user.phone || ''}
		class="md:col-span-6"
		input={{ inputmode: 'tel' }}
	/>

	<InputText key="firstName" label="Prénom" value={user.firstName} class="md:col-span-4" />
	<InputText key="lastName" label="Nom de famille" value={user.lastName} class="md:col-span-4" />
	<InputDate key="birthday" label="Date de naissance" value={user.birthday} class="md:col-span-4" />

	<InputText key="street" label="Rue et numéro" value={user.street || ''} class="md:col-span-4" />
	<InputText key="zipCode" label="Code postal" value={user.zipCode || ''} class="md:col-span-4" />
	<InputText key="city" label="Localité" value={user.city || ''} class="md:col-span-4" />

	<div class="flex gap-1 items-center justify-end col-span-full">
		<button class="btn btn-primary">Sauvegarder </button>
	</div>
</form>
