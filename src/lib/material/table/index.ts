import { getContext, setContext } from 'svelte'

export { type TableField } from './field'
export { default as Table } from './Table.svelte'
export { default as TableHead } from './TableHead.svelte'
export { default as TableBody } from './TableBody.svelte'
export { default as TableCell } from './TableCell.svelte'
export { default as TableFieldsSelect } from './TableFieldsSelect.svelte'
export * from './head'
export * from './field'

type Context = { KEY_FIELDS_VISIBLE: string; KEY_FIELDS_ORDER: string }
export const context = {
	set: setContext<Context>,
	get: getContext<Context>,
}
