<script lang="ts">
	import { EyeOffIcon, PencilOffIcon } from '@lucide/svelte'
	import type { Prisma } from '@prisma/client'
	import {
		InputBoolean,
		InputCheckboxes,
		InputNumber,
		InputRadio,
		InputString,
		InputTextarea,
		tip,
	} from 'fuma'
	import { page } from '$app/state'
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

	// Avec un `field`, les composants de fuma prennent `value` comme valeur initiale: elle
	// sert de repli tant que le champ n'a rien.
	const text = $derived(typeof value === 'object' ? '' : String(value))

	let isLeader = $derived(page.data.member?.roles.includes('leader'))
	let disabled = $derived(!field.memberCanWrite && !isLeader)
</script>

<div class="{field.type === 'textarea' ? '@lg:col-span-6' : ''} {klass}">
	<div class="h-5">
		{#if !field.memberCanRead}
			<span class="inline-flex" use:tip={{ content: 'Les membres ne peuvent pas voir ce champ' }}
				><EyeOffIcon size={20} class="ml-3 opacity-75" /></span
			>
		{:else if !field.memberCanWrite}
			<span class="inline-flex" use:tip={{ content: 'Les membres ne peuvent pas éditer ce champ' }}
				><PencilOffIcon size={20} class="ml-3 opacity-75" /></span
			>
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
			value={typeof value === 'number' ? value : undefined}
			{disabled}
		/>
	{:else if field.type === 'textarea'}
		<InputTextarea field={formField} label={field.label || field.name} value={text} {disabled} />
	{:else if field.type === 'select'}
		<InputRadio field={formField} label={field.label || field.name} options={field.options ?? []} />
	{:else if field.type === 'multiselect'}
		<InputCheckboxes
			field={formField}
			label={field.label || field.name}
			value={Array.isArray(value) ? value : []}
			options={field.options ?? []}
			{disabled}
		/>
	{:else}
		<InputString field={formField} label={field.label || field.name} value={text} {disabled} />
	{/if}
</div>
