<script lang="ts" module>
	import type { z } from 'zod'
	import type { FormDataInput } from '$lib/fuma-legacy/ui/form/form.js'
</script>

<script
	lang="ts"
	generics="
		Shape extends z.ZodRawShape,
		ReturnData extends Record<string, unknown> = FormDataInput<Shape>,
		Data extends FormDataInput<Shape> = FormDataInput<Shape>
	"
>
	import { onMount, type Snippet } from 'svelte'
	import { fade } from 'svelte/transition'
	import { page } from '$app/stores'
	import { contextContainer } from '$lib/fuma-legacy/ui/context.js'
	import {
		initData,
		type FormField,
		type FormSectionProps,
		type BoolOrFunction,
		type Nullable,
		getFieldType,
		useHandleInput,
	} from '$lib/fuma-legacy/ui/form/form.js'
	import { ButtonDelete } from 'fuma'

	import { useForm, type UseFormOptions } from '$lib/fuma-legacy/validation/form.js'
	import FormInput from '$lib/fuma-legacy/ui/form/FormInput.svelte'
	import FormSection from '$lib/fuma-legacy/ui/form/FormSection.svelte'

	interface Props {
		class?: string
		classSection?: string
		classAction?: string
		model?: Shape
		fields?: FormField<Shape>[][]
		sections?: FormSectionProps<Shape>[]
		action?: string
		actionCreate?: string
		actionDelete?: string
		actionUpdate?: string
		/** Ignore actionCreate, actionDelete and actionUpdate */
		simpleAction?: boolean
		options?: UseFormOptions<ReturnData>
		data?: Nullable<Data>
		/** Remplacent les évènements de la version Svelte 4. */
		onsuccess?: (payload: { action: URL; data?: ReturnData }) => void
		oncreated?: (data: ReturnData) => void
		onupdated?: (data: ReturnData) => void
		ondeleted?: () => void
		delete?: Snippet<[{ formaction: string }]>
		children?: Snippet
	}

	let {
		class: klass = '',
		classSection = '',
		classAction = '',
		model = undefined,
		fields = [],
		sections = [{}],
		action = '',
		actionCreate = '_create',
		actionDelete = '_delete',
		actionUpdate = '_update',
		simpleAction = false,
		options = {},
		data: dataInput = $bindable(initData<Shape, Data>(fields)),
		onsuccess,
		oncreated,
		onupdated,
		ondeleted,
		// Renommé à la destructuration: `delete` est un mot réservé.
		delete: deleteSnippet,
		children,
	}: Props = $props()

	let data = $state(dataInput)

	export function set<K extends keyof Shape>(key: K, value: Nullable<Data>[K]) {
		isDirty.set(true)
		data[key] = value
	}
	export function update(updater: (currentData: Nullable<Data>) => Nullable<Data>) {
		isDirty.set(true)
		data = updater(data)
	}

	const { enhance, setError } = useForm<ReturnData>({
		...options,
		async onSuccess(url, resultData) {
			if (options.onSuccess) await options.onSuccess(url, resultData)
			onsuccess?.({ action: url, data: resultData })
			const actionPath = url.pathname + url.search
			if (actionPath.includes(action + actionDelete)) ondeleted?.()
			if (!resultData) return
			if (actionPath.includes(action + actionCreate)) oncreated?.(resultData)
			if (actionPath.includes(action + actionUpdate)) onupdated?.(resultData)
		},
	})
	const { handleInput, isDirty } = useHandleInput({ model, setError })

	onMount(lookupValueFromParams)
	$effect(() => {
		if ($isDirty) dataInput = data
		else data = dataInput
	})

	function lookupValueFromParams() {
		fields.flat().forEach(({ key }) => {
			if (data[key]) return
			const value = $page.url.searchParams.get(key)
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
	oninput={handleInput}
>
	{#if data?.id}
		<input type="hidden" name="id" value={data.id} />
	{/if}

	{@render children?.()}

	{#each fields as groupFields, groupIndex (groupIndex)}
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
		<div class="grow"></div>
		{#if !simpleAction && data.id && actionDelete}
			{@const formaction = `${action}${actionDelete}`}
			{#if deleteSnippet}
				{@render deleteSnippet({ formaction })}
			{:else}
				<ButtonDelete {formaction}>Supprimer</ButtonDelete>
			{/if}
		{/if}
	</div>
</form>
