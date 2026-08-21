<script lang="ts">
	import { EyeOffIcon, PencilOffIcon } from '@lucide/svelte'
	import type { Prisma } from '@prisma/client'
	import {
		InputBoolean,
		InputCheckboxes,
		InputMultiSelect,
		InputNumber,
		InputRadio,
		InputSelect,
		InputString,
		InputTextarea,
		parseOptions,
		tip,
	} from 'fuma'
	import { page } from '$app/state'
	import { updateMemberProfile } from './member.remote'

	interface Props {
		field: Omit<Prisma.FieldUncheckedCreateInput, 'eventId'>
		value?: string | number | boolean | string[]
		/**
		 * Les champs à choix tiennent sur une ligne, en liste déroulante: de quoi poser le
		 * profil au milieu d'une page plutôt que dans un tiroir à lui.
		 */
		compact?: boolean
		class?: string
	}

	let { field, value = '', compact = false, class: klass = '' }: Props = $props()

	// Le schéma est construit côté serveur à partir des champs de l'évènement: le formulaire est
	// donc `unchecked`, et ses `fields` s'indexent par l'id du champ.
	const formField = $derived(updateMemberProfile.fields[field.id!])

	// Avec un `field`, les composants de fuma prennent `value` comme valeur initiale: elle
	// sert de repli tant que le champ n'a rien.
	const text = $derived(typeof value === 'object' ? '' : String(value))
	const values = $derived(Array.isArray(value) ? value : [])

	// Les selects prennent l'item et non la valeur soumise: les options sont donc résolues ici.
	const options = $derived(parseOptions(field.options ?? []))

	let isLeader = $derived(page.data.member?.roles.includes('leader'))
	let disabled = $derived(!field.memberCanWrite && !isLeader)
</script>

<div class={[field.type === 'textarea' && 'col-span-full', '@max-lg:col-span-full', klass]}>
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
		{#if compact}
			<InputSelect
				field={formField}
				label={field.label || field.name}
				items={options}
				value={options.find((option) => option.value === text)}
				nullable={!field.required}
				{disabled}
			/>
		{:else}
			<InputRadio
				field={formField}
				label={field.label || field.name}
				options={field.options ?? []}
			/>
		{/if}
	{:else if field.type === 'multiselect'}
		{#if compact}
			<InputMultiSelect
				field={formField}
				label={field.label || field.name}
				items={options}
				value={options.filter((option) => values.includes(option.value))}
				{disabled}
			/>
		{:else}
			<InputCheckboxes
				field={formField}
				label={field.label || field.name}
				value={values}
				options={field.options ?? []}
				{disabled}
			/>
		{/if}
	{:else}
		<InputString field={formField} label={field.label || field.name} value={text} {disabled} />
	{/if}
</div>
