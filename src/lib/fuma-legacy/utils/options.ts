import type { IconProps } from '@lucide/svelte'
import { jsonParse } from 'fuma'
import type { Component } from 'svelte'

export type Option = { value: string; label: string; icon?: Component<IconProps> }
export type OptionRecord<Values extends string> = Record<Values, Omit<Option, 'value'>>
export type Options = string | string[] | Option[] | Record<string, string> | OptionRecord<string>
export function parseOptions(options: Options): Option[] {
	if (typeof options === 'string') {
		options = jsonParse(options, [])
	}
	if (Array.isArray(options)) {
		return options.filter(Boolean).map((opt) => {
			if (typeof opt === 'string') return { value: opt, label: opt }
			return opt
		})
	}
	return Object.entries(options)
		.filter(([value]) => !!value)
		.map(([value, opt]) => {
			if (typeof opt === 'string') return { value, label: opt }
			return { value, ...opt }
		})
}
