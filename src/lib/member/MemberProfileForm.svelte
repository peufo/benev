<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import type { Event, FieldValue, Field } from '@prisma/client'

	import { useForm } from '$lib/form'
	import { enhance } from '$app/forms'
	import MemberField from './MemberField.svelte'

	let klass = ''
	export { klass as class }
	export let event: Event & { memberFields: Field[] }
	export let fieldsValue: FieldValue[]
	export let memberId = ''
	/** Hide readonly fields */
	export let writeOnly = false

	const dispatch = createEventDispatcher<{ success: void }>()

	const form = useForm({
		successReset: false,
		successCallback: () => dispatch('success'),
	})
</script>

<form
	method="post"
	action="/{event.id}/me/profile"
	use:enhance={form.submit}
	class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 grid-flow-row-dense {klass}"
>
	{#if memberId}
		<input type="hidden" name="memberId" value={memberId} />
	{/if}

	{#each event.memberFields.filter((f) => !writeOnly || f.memberCanWrite) as field (field.id)}
		{@const { value } = fieldsValue.find((value) => value.fieldId === field.id) || { value: '' }}
		<MemberField {field} {value} isLeader={!!memberId} class="md:col-span-3" />
	{/each}

	<div class="flex justify-end md:col-span-12">
		<button class="btn"> Sauvegarder </button>
	</div>
</form>
