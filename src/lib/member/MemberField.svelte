<script lang="ts">
	import { HatGlassesIcon, PencilOffIcon } from '@lucide/svelte'
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

{#snippet labelAppend()}
	{#if !field.memberCanRead}
		<span class="ml-auto mr-1" use:tip={{ content: 'Les membres ne peuvent pas voir ce champ' }}>
			<HatGlassesIcon size={16} class="opacity-75" />
		</span>
	{:else if !field.memberCanWrite}
		<span class="ml-auto mr-1" use:tip={{ content: 'Les membres ne peuvent pas éditer ce champ' }}>
			<PencilOffIcon size={16} class="ml-auto opacity-75" />
		</span>
	{:else if field.required && field.type !== 'boolean' && field.type !== 'multiselect'}
		<span
			class="text-error text-xl ml-auto mr-2 h-4.5"
			use:tip={{ content: 'Ce champ est obligatoire' }}
		>
			*
		</span>
	{/if}
{/snippet}

<div class={[field.type === 'textarea' && 'col-span-full', '@max-lg:col-span-full', klass]}>
	{#if field.type === 'boolean'}
		<InputBoolean
			field={formField}
			label={field.label || field.name}
			checked={value === true}
			{disabled}
			{labelAppend}
		/>
	{:else if field.type === 'number'}
		<InputNumber
			field={formField}
			label={field.label || field.name}
			value={typeof value === 'number' ? value : undefined}
			{disabled}
			{labelAppend}
		/>
	{:else if field.type === 'textarea'}
		<InputTextarea
			field={formField}
			label={field.label || field.name}
			value={text}
			{disabled}
			{labelAppend}
		/>
	{:else if field.type === 'select'}
		{#if compact}
			<InputSelect
				field={formField}
				label={field.label || field.name}
				items={options}
				value={options.find((option) => option.value === text)}
				nullable={!field.required}
				{disabled}
				{labelAppend}
			/>
		{:else}
			<InputRadio
				field={formField}
				label={field.label || field.name}
				options={field.options ?? []}
				value={text}
				{disabled}
				{labelAppend}
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
				{labelAppend}
			/>
		{:else}
			<InputCheckboxes
				field={formField}
				label={field.label || field.name}
				value={values}
				options={field.options ?? []}
				{disabled}
				{labelAppend}
			/>
		{/if}
	{:else}
		<InputString
			field={formField}
			label={field.label || field.name}
			value={text}
			{disabled}
			{labelAppend}
		/>
	{/if}
</div>
