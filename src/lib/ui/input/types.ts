import type { ComponentProps } from 'svelte'
import type { HTMLInputAttributes, HTMLTextareaAttributes } from 'svelte/elements'
import { default as FormControl } from '$lib/fuma-legacy/ui/input/FormControl.svelte'

export type InputProps<T = string> = ComponentProps<typeof FormControl> & {
	input?: HTMLInputAttributes
	inputElement?: HTMLInputElement
	classWrapper?: string
	value?: T | null
	bindWithParams?: boolean
}
export type TextareaProps = ComponentProps<typeof FormControl> & {
	textarea?: HTMLTextareaAttributes
	value?: string | null
	bindWithParams?: boolean
}
