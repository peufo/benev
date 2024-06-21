<script lang="ts">
	import { mdiAlertOctagonOutline, mdiCheck } from '@mdi/js'
	import { createEventDispatcher, onMount } from 'svelte'
	import { useForm, Icon, InputText, InputDate, FormControl, InputBoolean } from 'fuma'
	import { enhance } from '$app/forms'
	import { page } from '$app/stores'
	import type { User } from '@prisma/client'

	export let user: User
	export let successReset = false
	export let successUpdate = false

	const dispatch = createEventDispatcher<{ success: void }>()

	const formProfile = useForm({
		successReset,
		successUpdate,
		successMessage: 'Profil sauvegardé',
		onSuccess() {
			dispatch('success')
		},
	})

	let verificationEmailSent = false
	const verificationEmailMessage = 'Un email de verification à été envoyé'
	const formEmailVerification = useForm({
		successMessage: verificationEmailMessage,
		onSuccess() {
			verificationEmailSent = true
		},
	})

	onMount(() => {
		$page.data.member?.userProfileRequiredFields.forEach((key) =>
			formProfile.setError(key, 'Valeur manquante')
		)
	})
</script>

<form
	id="verify_email"
	method="post"
	action="/me?/verify_email"
	use:enhance={formEmailVerification.submit}
/>

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
				class="input-bordered input join-item grow"
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

	<div class="col-span-full">
		<InputBoolean
			key="wantsNotification"
			label="Être notifié par mail quand mes inscriptions changent de statut"
			value={user.wantsNotification}
		/>
	</div>

	<div class="flex gap-1 items-center justify-end col-span-full">
		<button class="btn btn-primary">Sauvegarder </button>
	</div>
</form>
