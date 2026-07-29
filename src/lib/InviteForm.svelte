<script lang="ts">
	import { InputString } from 'fuma'
	import z from 'zod'
	import { slide } from 'svelte/transition'
	import { toast } from 'svelte-sonner'
	import type { Member } from '@prisma/client'
	import { api } from './api'
	import { createInvite } from './member/member.remote'

	interface Props {
		onCreate?: (member: Member) => void
	}

	let { onCreate = () => {} }: Props = $props()
	let email = $state('')
	let isLoadingUserExists = $state(false)
	let user = $state({ firstName: '', lastName: '' })

	async function handleEmailInput(event: Event & { currentTarget: HTMLInputElement }) {
		email = event.currentTarget.value
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

	// TODO: ajouter l'édition du profile
	// Lors de la recherche <-- Comment gérer la recherche dans L'ui ?
	// Si l'utilisateur est membre d'un évenement auquel on est admin ou responsable,
	// $api.member.search('xyz', { anyEvents: true })
	// Remplir automatiquement le profile depuis l'événement le plus récent
</script>

<form
	{...createInvite.enhance(async ({ submit }) => {
		await submit()
		// `result` porte le membre créé une fois la soumission résolue.
		const member = createInvite.result
		if (!member) return
		toast.success('Invitation envoyée')
		onCreate(member)
	})}
	class="flex flex-col gap-4"
>
	<div class="grid grid-cols-2 gap-4 my-6">
		<div class="col-span-2 flex items-center gap-2">
			<InputString
				label="Email"
				class="grow"
				field={createInvite.fields.email}
				autocomplete="off"
				oninput={handleEmailInput}
			/>
			{#if isLoadingUserExists}
				<div transition:slide={{ axis: 'x' }} class="w-10 grid place-content-center">
					<div class="loading loading-ring loading-xs"></div>
				</div>
			{/if}
		</div>
		<InputString
			label="Prénom"
			field={createInvite.fields.firstName}
			autocomplete="off"
			defaultValue={user.firstName}
		/>
		<InputString
			label="Nom"
			field={createInvite.fields.lastName}
			autocomplete="off"
			defaultValue={user.lastName}
		/>
	</div>

	<div class="flex flex-row-reverse gap-2 border-t pt-4">
		<button class="btn btn-primary">Valider</button>
	</div>
</form>
