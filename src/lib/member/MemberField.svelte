<script lang="ts">
	import type { Prisma, FieldType } from '@prisma/client'
	import type { ComponentType } from 'svelte'
	import { mdiEyeOffOutline, mdiPencilOffOutline } from '@mdi/js'
	import {
		InputText,
		InputTextarea,
		InputNumber,
		InputBoolean,
		InputRadio,
		InputCheckboxs,
		Icon,
	} from '$lib/fuma-legacy'
	import { page } from '$app/stores'
	import { jsonParse } from '$lib/jsonParse'

	interface Props {
		field: Omit<Prisma.FieldUncheckedCreateInput, 'eventId'>
		value?: string | number | true | string[]
		class?: string
	}

	let { field, value = '', class: klass = '' }: Props = $props()

	const components: Record<FieldType, ComponentType> = {
		string: InputText,
		textarea: InputTextarea,
		number: InputNumber,
		boolean: InputBoolean,
		select: InputRadio,
		multiselect: InputCheckboxs,
	}

	const classes: Record<FieldType, string> = {
		string: '',
		textarea: '@lg:col-span-6',
		number: '',
		boolean: '',
		select: '',
		multiselect: '',
	}

	let isLeader = $derived($page.data.member?.roles.includes('leader'))

	const SvelteComponent = $derived(components[field.type])
</script>

<SvelteComponent
	{value}
	class="{classes[field.type]} {klass}"
	key={field.id}
	label={field.label || field.name}
	options={jsonParse(field.options, [])}
	input={{ disabled: !field.memberCanWrite && !isLeader }}
>
	{#snippet label_append()}
		<div class="h-5 mr-auto">
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
				<span class="text-error text-xl ml-1">*</span>
			{/if}
			<div class="grow"></div>
		</div>
	{/snippet}
</SvelteComponent>
