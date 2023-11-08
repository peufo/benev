<script lang="ts">
	import type { User } from '@prisma/client'
	import dayjs from 'dayjs'
	import 'dayjs/locale/fr-ch'
	import { useForm } from '$lib/form'
	import { enhance } from '$app/forms'
	import { InputText, InputDate, FormControl } from '$lib/material/input'
	import { Icon } from '$lib/material'
	import { mdiAlertOctagonOutline, mdiCheck } from '@mdi/js'
	import InputBoolean from '$lib/material/input/InputBoolean.svelte'

	export let user: User

	let verificationEmailSent = false

	const successMessages: Record<string, string> = {
		'?/update_profile': 'Profile sauvegardé',
		'?/verify_email': 'Un email de verification à été envoyé',
	}
	const verificationEmailMessage = 'Un email de verification à été envoyé'
	const form = useForm({
		successReset: false,
		successMessage: (action) => {
			if (action.search === '?/verify_email') verificationEmailSent = true
			return successMessages[action.search] || 'Succès'
		},
	})
</script>

<form
	method="post"
	action="/me?/update_profile"
	use:enhance={form.submit}
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
				readonly
				disabled
				class="input-bordered input join-item grow"
			/>

			{#if user.isEmailVerified}
				<div class="btn-square join-item grid place-content-center bg-base-200">
					<Icon path={mdiCheck} class="fill-success" title="Votre email a été verifié" />
				</div>
			{:else}
				<button
					
					class="btn btn-square join-item"
					formaction="/me?/verify_email"
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
	<InputDate
		key="birthday"
		label="Date de naissance"
		value={dayjs(user.birthday).format('YYYY-MM-DD')}
		class="md:col-span-4"
	/>

	<InputText key="street" label="Rue et numéro" value={user.street || ''} class="md:col-span-4" />
	<InputText key="zipCode" label="Code postal" value={user.zipCode || ''} class="md:col-span-4" />
	<InputText key="city" label="Localité" value={user.city || ''} class="md:col-span-4" />

	<InputBoolean
		key="wantsNotification"
		label="Être notifié par mail quand mes inscriptions change de statut"
		class="col-span-full"
		value={user.wantsNotification}
	/>

	<div class="flex items-center col-span-full">
		<span class="text-xs opacity-70">
			Ces informations ne sont partagées qu'avec les responsables des événements auquels tu
			participes.
		</span>
		<div class="grow" />
		<button class="btn">Sauvegarder </button>
	</div>
</form>
