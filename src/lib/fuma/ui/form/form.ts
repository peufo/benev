import type { z } from 'zod'
import debounce from 'debounce'
import type { ComponentProps } from 'svelte'
import { writable, type Writable } from 'svelte/store'
import type { FormEventHandler } from 'svelte/elements'
import {
	formInputsType,
	type FormInputsProps,
	type FormInputsType,
} from '$lib/fuma/ui/form/formInput.js'

import type FormSection from '$lib/fuma/ui/form/FormSection.svelte'

type Shape = z.ZodRawShape
type PickOne<T> = {
	[P in keyof T]: Record<P, T[P]> & Partial<Record<Exclude<keyof T, P>, undefined>>
}[keyof T]

export type Nullable<T> = {
	[P in keyof T]?: T[P] | null
}

export type BoolOrFunction<S extends Shape> =
	boolean | ((data: Nullable<FormDataInput<S>>) => unknown)

// zod 4 a retiré la propriété `_input` des schémas au profit du helper `z.input`.
// En zod 3, `ZodObject<S>['_input']` portait en plus une index signature (catchall
// `ZodTypeAny`) dont `Form.svelte` dépend pour indexer par clé et lire `data.id`
// sans connaître la forme concrète: on la restitue explicitement.
// Le catchall de zod 3 était typé `any` (et non `unknown`): c'est ce qui permet à
// `FormInput` de recevoir `data[field.key]` sans que la valeur soit narrowée en même
// temps que `type`. Conserver `unknown` ici casserait les 12 variantes de `$$Props`.
export type FormDataInput<S extends Shape> = { [K in keyof S]: z.input<S[K]> } & {
	[key: string]: any
}

export type FormField<S extends Shape> = {
	key: string & keyof S
	/** number col used by field */
	colSpan?: number
	/** hide field if true */
	hide?: BoolOrFunction<S>
} & PickOne<FormInputsProps>

export type FormSectionProps<S extends Shape> = ComponentProps<FormSection> & {
	/** hide group if true */
	hide?: BoolOrFunction<S>
}

export function initData<S extends Shape, Data extends FormDataInput<S> = FormDataInput<S>>(
	fields: FormField<S>[][]
): Data {
	// @ts-ignore
	return fields.flat().reduce((acc, cur) => {
		const inputType = getFieldType(cur)
		// @ts-ignore
		return { ...acc, [cur.key]: cur[inputType]?.value }
	}, {})
}

export function getFieldType<S extends Shape>(field: FormField<S>): FormInputsType {
	const inputType = formInputsType.find((t) => field[t])
	if (!inputType) return 'text'
	return inputType
}

type HandleInputOptions<S extends Shape> = {
	model?: S
	setError: (key: string, value: string) => void
}

export function useHandleInput<S extends Shape>({
	model,
	setError,
}: HandleInputOptions<S>): {
	isDirty: Writable<boolean>
	handleInput: FormEventHandler<HTMLFormElement>
} {
	const isDirty = writable(false)
	const setErrorDebounced = debounce(setError, 1500)

	return {
		isDirty,
		handleInput: ({ target }) => {
			if (!target) return
			if (!model) return
			const { name } = target as HTMLInputElement
			const value = getTypedValue(target as HTMLInputElement)
			if (value === undefined) return
			if (name === undefined) return
			if (!model[name]) return
			isDirty.set(true)
			// `ZodRawShape` indexe des `$ZodType` (le type noyau), qui n'expose pas
			// `safeParse`. Les valeurs sont bien des schémas classiques à l'exécution.
			const res = (model[name] as z.ZodType).safeParse(value)
			if (res.success) {
				setErrorDebounced.clear()
				setError(name, '')
			} else {
				setErrorDebounced(name, res.error.issues[0].message)
			}
		},
	}
}

function getTypedValue(target: HTMLInputElement) {
	const { type, value, valueAsNumber, valueAsDate, checked } = target as HTMLInputElement
	const typeMapValue: Record<string, unknown> = {
		number: valueAsNumber,
		date: valueAsDate,
		text: value,
		checkbox: checked,
	}
	return typeMapValue[type] ?? value
}
