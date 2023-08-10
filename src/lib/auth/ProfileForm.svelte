<script lang="ts">
	import type { User } from '@prisma/client'
	import dayjs from 'dayjs'
	import { useForm, userSizeLabel } from '$lib/form'
	import { enhance } from '$app/forms'
	import {
		InputText,
		InputDate,
		InputBoolean,
		InputRadio,
		InputTextarea,
		InputCheckboxs,
	} from '$lib/material/input'

	export let user: User

	const form = useForm({
		successReset: false,
		successMessage: 'Profile sauvegardé',
	})
</script>

<form
	method="post"
	action="/auth/profile"
	use:enhance={form.submit}
	class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4"
>
	<InputText
		key="email"
		label="Email"
		input={{ readonly: true, disabled: true }}
		value={user.email}
		class="md:col-span-6"
	/>
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
		key="isInsured"
		label="Assurance accident"
		value={user.isInsured}
		class="md:col-span-3"
	/>
	<InputRadio
		key="size"
		label="Taille de t-shirt"
		value={user.size || ''}
		options={userSizeLabel}
		class="md:col-span-3"
	/>

	<InputCheckboxs
		key="diet"
		label="Régime particulier"
		options={['Végétarien', 'Végétalien', 'Sans gluten', 'Sans lactose']}
		class="md:col-span-3"
		value={JSON.parse(user.diet || '[]')}
	/>

	<InputTextarea
		key="skillString"
		label="Compétences"
		value={user.skillString || ''}
		class="md:col-span-3"
		textarea={{ placeholder: 'Menuiserie, communication, informatique,...', rows: 4 }}
	/>

	<InputTextarea
		key="comment"
		label="Commentaires / expériences / allergies"
		class="md:col-span-12"
		textarea={{ rows: 3 }}
		value={user.comment || ''}
	/>

	<div class="flex justify-end md:col-span-12">
		<button class="btn">Sauvegarder </button>
	</div>
</form>
