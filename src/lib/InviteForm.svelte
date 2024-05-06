<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { useForm } from 'fuma/validation'
	import type { Member, User } from '@prisma/client'

	import { enhance } from '$app/forms'
	import { modelInvite } from '$lib/validation'
	import { eventPath } from '$lib/store'
	import { Form, InputText, type UseFormOptions } from 'fuma'

	type MemberWithUser = Member & { user: User }
	const dispatch = createEventDispatcher<{ success: MemberWithUser | undefined }>()
	const form = useForm<MemberWithUser>({
		onSuccess: (action, member) => dispatch('success', member),
		successMessage: 'Invitation envoyée',
		successUpdate: false,
	})

	const options: UseFormOptions<MemberWithUser> = {
		onSuccess: (action, member) => dispatch('success', member),
		successMessage: 'Invitation envoyée',
		successUpdate: false,
	}
</script>

<form
	method="post"
	action="{$eventPath}/invite?/new_invite"
	use:enhance={form.submit}
	class="flex flex-col gap-2"
>
	<InputText key="email" label="Email" input={{ autocomplete: 'off', autofocus: true }} />
	<div class="flex gap-2">
		<InputText key="firstName" label="Prénom" class="grow" input={{ autocomplete: 'off' }} />
		<InputText key="lastName" label="Nom" class="grow" input={{ autocomplete: 'off' }} />
	</div>
	<div class="flex justify-end">
		<button class="btn"> Valider </button>
	</div>
</form>

<Form
	action="/invite?/new_invite"
	actionPrefix={$eventPath}
	model={modelInvite}
	{options}
	fields={[
		[
			{
				key: 'email',
				colSpan: 4,
				text: {
					label: 'Email',
					input: { autocomplete: 'off', autofocus: true },
				},
			},
			{
				key: 'firstName',
				text: {
					label: 'Prénom',
					input: { autocomplete: 'off' },
				},
			},
			{
				key: 'lastName',
				text: {
					label: 'Nom',
					input: { autocomplete: 'off' },
				},
			},
		],
	]}
/>
