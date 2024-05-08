<script lang="ts">
	import type { ComponentType } from 'svelte'
	import { mdiEyeOffOutline, mdiPencilOffOutline } from '@mdi/js'
	import type { Prisma, FieldType } from '@prisma/client'
	import { page } from '$app/stores'
	import {
		jsonParse,
		Icon,
		InputText,
		InputTextarea,
		InputNumber,
		InputBoolean,
		InputRadio,
		InputCheckboxs,
	} from 'fuma'

	export let field: Omit<Prisma.FieldUncheckedCreateInput, 'eventId'>
	export let value: string | number | true | string[] = ''
	let klass = ''
	export { klass as class }

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

	$: isLeader = $page.data.member?.roles.includes('leader')
</script>

<svelte:component
	this={components[field.type]}
	{value}
	class="{classes[field.type]} {klass}"
	key={field.id}
	label={field.label || field.name}
	options={jsonParse(field.options, [])}
	input={{ disabled: !field.memberCanWrite && !isLeader }}
>
	<div class="h-5 mr-auto" slot="label_append">
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
		<div class="grow" />
	</div>
</svelte:component>
