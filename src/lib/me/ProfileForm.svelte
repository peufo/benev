<script lang="ts">
	import type { User } from '@prisma/client'
	import { mdiAlertOctagonOutline, mdiCheck } from '@mdi/js'
	import { onMount } from 'svelte'
	import { useForm } from '$lib/validation'
	import { enhance } from '$app/forms'
	import { InputText, InputDate, FormControl, InputBoolean } from '$lib/material/input'
	import { Icon } from '$lib/material'
	import { page } from '$app/stores'

	export let user: User

	let verificationEmailSent = false

	const verificationEmailMessage = 'Un email de verification à été envoyé'
	const formProfile = useForm({
		successReset: false,
		successMessage: 'Profile sauvegardé',
	})

	const formEmailVerification = useForm({
		successMessage: verificationEmailMessage,
		successCallback() {
			verificationEmailSent = true
		},
	})

	onMount(() => {
		// $page.data.member?.userProfileRequiredFields
		setTimeout(() => {}, 1000)
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
	action="/me?/update_profile"
	use:enhance={formProfile.submit}
	class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4"
>
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

	<InputText key="phone" label="Téléphone" value={user.phone || ''} class="md:col-span-6" />

	<InputText key="firstName" label="Prénom" value={user.firstName} class="md:col-span-4" />
	<InputText key="lastName" label="Nom de famille" value={user.lastName} class="md:col-span-4" />
	<InputDate key="birthday" label="Date de naissance" value={user.birthday} class="md:col-span-4" />

	<InputText key="street" label="Rue et numéro" value={user.street || ''} class="md:col-span-4" />
	<InputText key="zipCode" label="Code postal" value={user.zipCode || ''} class="md:col-span-4" />
	<InputText key="city" label="Localité" value={user.city || ''} class="md:col-span-4" />

	<InputBoolean
		key="wantsNotification"
		label="Être notifié par mail quand mes inscriptions change de statut"
		class="col-span-full"
		value={user.wantsNotification}
	/>

	<div class="flex gap-1 items-center col-span-full">
		<span class="text-xs opacity-70">
			Ces informations ne sont partagées qu'avec les responsables des évènements auquels tu
			participes.
		</span>
		<div class="grow" />
		<button class="btn">Sauvegarder </button>
	</div>
</form>
