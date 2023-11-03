<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	import { useForm } from '$lib/form'
	import { enhance } from '$app/forms'
	import MemberField from './MemberField.svelte'
	import type { MemberProfile } from '$lib/server'

	let klass = ''
	export { klass as class }

	export let member: MemberProfile

	const dispatch = createEventDispatcher<{ success: void }>()

	const form = useForm({
		successReset: false,
		successCallback: () => dispatch('success'),
	})
</script>

<form
	method="post"
	action="/me/{member.eventId}"
	use:enhance={form.submit}
	class="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-4 {klass}"
>
	<input type="hidden" name="memberId" value={member.id} />

	{#each member.event.memberFields as field (field.id)}
		{@const { value } = member.profile.find((value) => value.fieldId === field.id) || { value: '' }}
		<MemberField {field} {value} class="col-span-3" />
	{/each}

	<div class="flex justify-end col-span-full">
		<button class="btn"> Sauvegarder </button>
	</div>
</form>
