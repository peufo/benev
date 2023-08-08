<script lang="ts">
	import type { User } from '@prisma/client'
	import dayjs from 'dayjs'
	import { useForm, userSizeLabel } from '$lib/form'
	import { enhance } from '$app/forms'
	import { InputText, InputDate, InputBoolean, InputRadio } from '$lib/material/input'

	export let user: User

	const form = useForm()
</script>

<form method="post" use:enhance={form.submit} class="grid grid-cols-12 gap-4">
	<InputText
		key="email"
		label="Email"
		input={{ readonly: true, disabled: true }}
		value={user.email}
		class="col-span-6"
	/>
	<InputText key="phone" label="Téléphone" value={user.phone || ''} class="col-span-6" />

	<InputText key="firstName" label="Prénom" value={user.firstName} class="col-span-4" />
	<InputText key="lastName" label="Nom de famille" value={user.lastName} class="col-span-4" />
	<InputDate
		key="birthday"
		label="Date de naissance"
		value={dayjs(user.birthday).format('YYYY-MM-DDTHH:mm')}
		class="col-span-4"
	/>

	<InputText key="street" label="Rue et numéro" value={user.street || ''} class="col-span-4" />
	<InputText key="zipCode" label="Code postal" value={user.zipCode || ''} class="col-span-4" />
	<InputText key="city" label="Localité" value={user.city || ''} class="col-span-4" />

  <InputBoolean key="isInsured" label="Assurance accident" value={user.isInsured} class="col-span-4"/>
  <InputRadio key="size" label="Taille de t-shirt" options={userSizeLabel} class="col-span-4"/>

  <!--
    size        Size?
    diet        String?
    skillString String? // TODO: replace by tags système ?
    comment     String?
  -->


	<div class="flex justify-end col-span-12">
		<button class="btn">Sauvegarder </button>
	</div>
</form>
