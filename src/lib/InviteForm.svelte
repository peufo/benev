<script lang="ts">
	import { Form, InputText } from 'fuma'
	import z from 'zod'
	import { slide } from 'svelte/transition'
	import { toast } from 'svelte-sonner'
	import { modelInvite } from '$lib/models'
	import { eventPath } from '$lib/store'
	import { api } from './api'

	let email = ''
	let isLoadingUserExists = false
	let user = { firstName: '', lastName: '' }

	async function handleEmailInput() {
		const { success } = z.safeParse(z.email(), email)
		if (!success) return
		isLoadingUserExists = true
		const res = await $api.user(email).finally(() => (isLoadingUserExists = false))
		user.firstName = res.firstName
		user.lastName = res.lastName
		if (res.firstName) {
			toast.success('Utilisateur trouvé !')
		}
	}
</script>

<Form
	action="{$eventPath}/invite?/invite"
	model={modelInvite}
	options={{
		successMessage: 'Invitation envoyée',
		successUpdate: false,
		onFail(failure) {
			if (failure) toast.error(failure.message)
		},
	}}
	on:created
	on:updated
	on:deleted
	on:success
>
	<div class="grid grid-cols-2 gap-4 my-6">
		<InputText
			label="Email"
			key="email"
			class="col-span-2"
			classWrapper="flex items-center"
			input={{ autocomplete: 'off' }}
			bind:value={email}
			on:input={handleEmailInput}
		>
			<div slot="append">
				{#if isLoadingUserExists}
					<div transition:slide={{ axis: 'x' }} class="w-10 grid place-content-center">
						<div class="loading loading-ring loading-xs" />
					</div>
				{/if}
			</div>
		</InputText>
		<InputText
			label="Prénom"
			key="firstName"
			input={{ autocomplete: 'off' }}
			value={user.firstName}
		/>
		<InputText label="Nom" key="lastName" input={{ autocomplete: 'off' }} value={user.lastName} />
	</div>
</Form>
