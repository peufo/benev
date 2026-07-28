import type { ComponentProps } from 'svelte'
import InputText from '$lib/fuma-legacy/ui/input/InputText.svelte'
import InputTextarea from '$lib/fuma-legacy/ui/input/InputTextarea.svelte'
import InputBoolean from '$lib/fuma-legacy/ui/input/InputBoolean.svelte'
import InputDate from '$lib/fuma-legacy/ui/input/InputDate.svelte'
import InputDatetime from '$lib/fuma-legacy/ui/input/InputDateTime.svelte'
import InputNumber from '$lib/fuma-legacy/ui/input/InputNumber.svelte'
import InputPassword from '$lib/fuma-legacy/ui/input/InputPassword.svelte'
import InputRadio from '$lib/fuma-legacy/ui/input/InputRadio.svelte'
import InputSelect from '$lib/fuma-legacy/ui/input/InputSelect.svelte'
import InputRelation from '$lib/fuma-legacy/ui/input/InputRelation.svelte'
import InputRelations from '$lib/fuma-legacy/ui/input/InputRelations.svelte'
import InputTextRich from '$lib/fuma-legacy/ui/input/textRich/InputTextRich.svelte'

export const formInputs = {
	text: InputText,
	textarea: InputTextarea,
	textrich: InputTextRich,
	boolean: InputBoolean,
	date: InputDate,
	datetime: InputDatetime,
	number: InputNumber,
	password: InputPassword,
	select: InputSelect,
	radio: InputRadio,
	relation: InputRelation as typeof InputRelation<any>,
	relations: InputRelations as typeof InputRelations<any>,
} as const

export type FormInputs = typeof formInputs
export type FormInputsType = keyof FormInputs
export type FormInputProps<T extends FormInputsType> = ComponentProps<InstanceType<FormInputs[T]>>
export type FormInputsProps = { [T in FormInputsType]: FormInputProps<T> }

export const formInputsType = Object.keys(formInputs) as FormInputsType[]
export function relationProps<Item extends { id: string }>(
	props: ComponentProps<InstanceType<typeof InputRelation<Item>>>
) {
	return props
}
export function relationsProps<Item extends { id: string }>(
	props: ComponentProps<InstanceType<typeof InputRelations<Item>>>
) {
	return props
}
