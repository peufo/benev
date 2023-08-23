import type { ComponentProps } from 'svelte'
import type { HTMLInputAttributes, HTMLTextareaAttributes } from 'svelte/elements'
import { default as FormControl } from './FormControl.svelte'

export type InputProps<T = string> = ComponentProps<FormControl> & {
	input?: HTMLInputAttributes
	inputElement?: HTMLInputElement
	wrapperClass?: string
	value?: T
	bindWithParams?: boolean
}
export type TextareaProps = ComponentProps<FormControl> & {
	textarea?: HTMLTextareaAttributes
	value?: string
	bindWithParams?: boolean
}

export { FormControl }
export { default as InputText } from './InputText.svelte'
export { default as InputPassword } from './InputPassword.svelte'
export { default as InputTextarea } from './InputTextarea.svelte'
export { default as InputRelations } from './InputRelations.svelte'
export { default as InputDate } from './InputDate.svelte'
export { default as InputDatetime } from './InputDatetime.svelte'
export { default as InputTime } from './InputTime.svelte'
export { default as InputNumber } from './InputNumber.svelte'
export { default as InputBoolean } from './InputBoolean.svelte'
export { default as InputRadio } from './InputRadio.svelte'
export { default as InputRadioButtons } from './InputRadioButtons.svelte'
export { default as InputCheckboxs } from './InputCheckboxs.svelte'
export { default as InputCheckboxsMenu } from './InputCheckboxsMenu.svelte'
export { default as InputSelect } from './InputSelect.svelte'
