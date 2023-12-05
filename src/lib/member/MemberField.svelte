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
	} from '$lib/material/input'
	import { page } from '$app/stores'
	import { jsonParse } from '$lib/jsonParse'
	import { Icon } from '$lib/material'

	export let field: Omit<Prisma.FieldUncheckedCreateInput, 'eventId'>
	export let value = ''
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

	const parseValue: Record<FieldType, (value: string) => string | boolean | number | string[]> = {
		string: (v) => v,
		textarea: (v) => v,
		number: (v) => +v,
		boolean: (v) => v === 'true',
		select: (v) => v,
		multiselect: (v) => jsonParse<string[]>(v, []),
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
	value={parseValue[field.type](value)}
	class="{classes[field.type]} {klass}"
	key={field.id}
	label={field.label || field.name}
	options={jsonParse(field.options, [])}
	input={{ disabled: !field.memberCanWrite && !isLeader }}
>
	<div class="contents" slot="label_append">
		{#if !field.memberCanRead}
			<Icon
				path={mdiEyeOffOutline}
				title="Les membres ne peuvent pas voir ce champ"
				class="ml-3 opacity-75"
			/>
			<div class="grow" />
		{:else if !field.memberCanWrite}
			<Icon
				path={mdiPencilOffOutline}
				title="Les membres ne peuvent pas éditer ce champ"
				class="ml-3 opacity-75"
			/>
			<div class="grow" />
		{/if}
	</div>
</svelte:component>
