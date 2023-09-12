<script lang="ts">
	import type { Prisma, FieldType } from '@prisma/client'
	import type { ComponentType } from 'svelte'
	import {
		InputText,
		InputTextarea,
		InputNumber,
		InputBoolean,
		InputRadio,
		InputCheckboxs,
	} from '$lib/material/input'
	import { jsonParse } from '$lib/jsonParse'

	export let field: Omit<Prisma.FieldUncheckedCreateInput, 'eventId'>
	export let value = ''
	let klass = ''
	export { klass as class }
	export let canWriteAll = false

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
		textarea: 'md:col-span-6',
		number: '',
		boolean: '',
		select: '',
		multiselect: '',
	}
</script>

<svelte:component
	this={components[field.type]}
	value={parseValue[field.type](value)}
	class="{classes[field.type]} {klass}"
	key={field.name}
	label={field.label || field.name}
	options={jsonParse(field.options, [])}
	input={{ disabled: !field.memberCanWrite && !canWriteAll }}
/>
