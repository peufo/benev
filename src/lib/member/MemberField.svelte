<script lang="ts">
	import type { Prisma } from '@prisma/client'
	import { mdiEyeOffOutline, mdiPencilOffOutline } from '@mdi/js'
	import { InputBoolean, InputNumber, InputRadio, InputString, InputTextarea } from 'fuma'
	import { Icon } from '$lib/fuma-legacy'
	import { page } from '$app/state'
	import InputCheckboxes from './InputCheckboxes.svelte'
	import { updateMemberProfile } from './member.remote'

	interface Props {
		field: Omit<Prisma.FieldUncheckedCreateInput, 'eventId'>
		value?: string | number | boolean | string[]
		class?: string
	}

	let { field, value = '', class: klass = '' }: Props = $props()

	// Le schéma est construit côté serveur à partir des champs de l'évènement: le formulaire est
	// donc `unchecked`, et ses `fields` s'indexent par l'id du champ.
	const formField = $derived(updateMemberProfile.fields[field.id!])

	// Les composants de fuma 2 n'acceptent pas de valeur initiale via `field`: `defaultValue`
	// est étalé après `field.as(…)` et sert de repli tant que rien n'a été soumis.
	const text = $derived(typeof value === 'object' ? '' : String(value))

	let isLeader = $derived(page.data.member?.roles.includes('leader'))
	let disabled = $derived(!field.memberCanWrite && !isLeader)
</script>

<div class="{field.type === 'textarea' ? '@lg:col-span-6' : ''} {klass}">
	<div class="h-5">
		{#if !field.memberCanRead}
			<Icon
				path={mdiEyeOffOutline}
				size={20}
				title="Les membres ne peuvent pas voir ce champ"
				class="ml-3 opacity-75"
			/>
		{:else if !field.memberCanWrite}
			<Icon
				path={mdiPencilOffOutline}
				size={20}
				title="Les membres ne peuvent pas éditer ce champ"
				class="ml-3 opacity-75"
			/>
		{:else if field.required && field.type !== 'boolean' && field.type !== 'multiselect'}
			<span class="text-error text-xl ml-3">*</span>
		{/if}
	</div>

	{#if field.type === 'boolean'}
		<InputBoolean
			field={formField}
			label={field.label || field.name}
			checked={value === true}
			defaultChecked={value === true}
			{disabled}
		/>
	{:else if field.type === 'number'}
		<InputNumber
			field={formField}
			label={field.label || field.name}
			defaultValue={typeof value === 'number' ? value : undefined}
			{disabled}
		/>
	{:else if field.type === 'textarea'}
		<InputTextarea
			field={formField}
			label={field.label || field.name}
			defaultValue={text}
			{disabled}
		/>
	{:else if field.type === 'select'}
		<InputRadio field={formField} label={field.label || field.name} options={field.options ?? []} />
	{:else if field.type === 'multiselect'}
		<InputCheckboxes
			field={formField}
			label={field.label || field.name}
			options={field.options ?? []}
			{disabled}
		/>
	{:else}
		<InputString
			field={formField}
			label={field.label || field.name}
			defaultValue={text}
			{disabled}
		/>
	{/if}
</div>
