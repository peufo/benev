<!-- @migration-task Error while migrating Svelte code: This migration would change the name of a slot (delete to delete_1) making the component unusable -->
<script lang="ts" context="module">
	import type { z } from 'zod'
	import type { FormDataInput } from '$lib/fuma/ui/form/form.js'
</script>

<script
	lang="ts"
	generics="
		Shape extends z.ZodRawShape,
		ReturnData extends Record<string, unknown> = FormDataInput<Shape>,
		Data extends FormDataInput<Shape> = FormDataInput<Shape>
	"
>
	import { createEventDispatcher, onMount } from 'svelte'
	import { fade } from 'svelte/transition'
	import { page } from '$app/stores'
	import { contextContainer } from '$lib/fuma/ui/context.js'
	import {
		initData,
		type FormField,
		type FormSectionProps,
		type BoolOrFunction,
		type Nullable,
		getFieldType,
		useHandleInput,
	} from '$lib/fuma/ui/form/form.js'
	import ButtonDelete from '$lib/fuma/ui/button/ButtonDelete.svelte'

	import { useForm, type UseFormOptions } from '$lib/fuma/validation/form.js'
	import FormInput from '$lib/fuma/ui/form/FormInput.svelte'
	import FormSection from '$lib/fuma/ui/form/FormSection.svelte'

	let klass = ''
	export { klass as class }
	export let classSection = ''
	export let classAction = ''
	export let model: Shape | undefined = undefined
	export let fields: FormField<Shape>[][] = []
	export let sections: FormSectionProps<Shape>[] = [{}]
	export let action = ''
	export let actionCreate = '_create'
	export let actionDelete = '_delete'
	export let actionUpdate = '_update'

	/** Ignore actionCreate, actionDelete and actionUpdate */
	export let simpleAction = false

	export let options: UseFormOptions<ReturnData> = {}
	let dataInput: Nullable<Data> = initData<Shape, Data>(fields)
	export { dataInput as data }

	let data = dataInput

	export function set<K extends keyof Shape>(key: K, value: Nullable<Data>[K]) {
		isDirty.set(true)
		data[key] = value
	}
	export function update(updater: (currentData: Nullable<Data>) => Nullable<Data>) {
		isDirty.set(true)
		data = updater(data)
	}

	const dispatch = createEventDispatcher<{
		success: { action: URL; data?: ReturnData }
		created: ReturnData
		updated: ReturnData
		deleted: void
	}>()

	const { enhance, setError } = useForm<ReturnData>({
		...options,
		async onSuccess(url, data) {
			if (options.onSuccess) await options.onSuccess(url, data)
			dispatch('success', { action: url, data })
			const actionPath = url.pathname + url.search
			if (actionPath.includes(action + actionDelete)) dispatch('deleted')
			if (!data) return
			if (actionPath.includes(action + actionCreate)) dispatch('created', data)
			if (actionPath.includes(action + actionUpdate)) dispatch('updated', data)
		},
	})
	const { handleInput, isDirty } = useHandleInput({ model, setError })

	onMount(lookupValueFromParams)
	$: $isDirty ? (dataInput = data) : (data = dataInput)

	function lookupValueFromParams() {
		fields.flat().forEach(({ key }) => {
			if (data[key]) return
			const value = $page.url.searchParams.get(key)
			// TODO: fix data[key] type
			// @ts-ignore
			if (value && key in data) data[key] = value
		})
	}

	const actionPadding = getActionPadding()
	function getActionPadding(): string {
		const container = contextContainer.get()
		if (container === 'drawer') return 'bottom-0 -ml-8 -mr-4 pl-8 pr-4'
		if (container === 'card') return 'bottom-0 -mx-2 sm:-mx-8 px-2 sm:px-8'
		if (container === 'dialog') return '-bottom-4 -mx-4 px-4'
		return 'bottom-0'
	}

	const getBoolean = (bool?: BoolOrFunction<Shape>) => (_data: Nullable<Data>) =>
		typeof bool === 'boolean' || bool === undefined ? !!bool : !!bool(_data)
</script>

<form
	method="post"
	action="{action}{simpleAction ? '' : data.id ? actionUpdate : actionCreate}"
	enctype="multipart/form-data"
	class="{klass} flex flex-col gap-4"
	use:enhance
	on:input={handleInput}
>
	{#if data?.id}
		<input type="hidden" name="id" value={data.id} />
	{/if}

	<slot />

	{#each fields as groupFields, groupIndex}
		{@const section = sections[groupIndex] || {}}
		{#if !getBoolean(section?.hide)(data)}
			<div class="contents" in:fade|local={{ duration: 200 }}>
				<FormSection {...section} class="{classSection} {section.class || ''} max-w-full">
					<div class="grid grid-cols-4 gap-x-4 gap-y-2">
						{#each groupFields as field (field.key)}
							{#if !getBoolean(field.hide)(data)}
								{@const inputType = getFieldType(field)}
								<div
									style={`grid-column: span ${field.colSpan || 2};`}
									in:fade|local={{ duration: 200 }}
								>
									<FormInput
										key={field.key}
										type={inputType}
										bind:value={data[field.key]}
										{...field[inputType]}
									/>
								</div>
							{/if}
						{/each}
					</div>
				</FormSection>
			</div>
		{/if}
	{/each}

	<div
		class="
			{classAction} {actionPadding}
			sticky col-span-full mt-2 flex flex-row-reverse gap-2 border-t py-4 backdrop-blur-sm
		"
	>
		<button class="btn btn-primary"> Valider </button>
		<div class="grow" />
		{#if !simpleAction && data.id && actionDelete}
			{@const formaction = `${action}${actionDelete}`}
			<slot name="delete" {formaction}>
				<ButtonDelete {formaction}>Supprimer</ButtonDelete>
			</slot>
		{/if}
	</div>
</form>
