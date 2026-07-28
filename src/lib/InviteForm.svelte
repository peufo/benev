<script lang="ts">
	import { Form, InputText } from '$lib/fuma'
	import z from 'zod'
	import { slide } from 'svelte/transition'
	import { toast } from 'svelte-sonner'
	import { modelInvite } from '$lib/models'
	import { eventPath } from '$lib/store'
	import { api } from './api'
	import type { Member } from '@prisma/client'

	interface Props {
		onCreate?: (member: Member) => void;
	}

	let { onCreate = () => {} }: Props = $props();
	let email = $state('')
	let isLoadingUserExists = $state(false)
	let user = $state({ firstName: '', lastName: '' })

	async function handleEmailInput() {
		// Search member
		const { success } = z.safeParse(z.email(), email)
		if (!success) return
		isLoadingUserExists = true
		const res = await $api.user(email).finally(() => (isLoadingUserExists = false))
		if (res) {
			user.firstName = res.firstName
			user.lastName = res.lastName
			toast.success('Utilisateur trouvé !')
		}
	}

	function onSuccess(action: URL, data: unknown) {
		onCreate(data as Member)
	}

	// TODO: ajouter l'édition du profile
	// Lors de la recherche <-- Comment gérer la recherche dans L'ui ?
	// Si l'utilisateur est membre d'un évenement auquel on est admin ou responsable,
	// $api.member.search('xyz', { anyEvents: true })
	// Remplir automatiquement le profile depuis l'événement le plus récent
</script>

<Form
	action="{$eventPath}/invite?/invite"
	model={modelInvite}
	options={{
		successMessage: 'Invitation envoyée',
		successUpdate: false,
		onSuccess,
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
			{#snippet append()}
						<div >
					{#if isLoadingUserExists}
						<div transition:slide={{ axis: 'x' }} class="w-10 grid place-content-center">
							<div class="loading loading-ring loading-xs"></div>
						</div>
					{/if}
				</div>
					{/snippet}
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
