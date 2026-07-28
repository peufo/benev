import { getContext, setContext } from 'svelte'

export type TableContext = {
	KEY_FIELDS_VISIBLE: string
	KEY_FIELDS_HIDDEN: string
	KEY_FIELDS_ORDER: string
}

export const createKeys = (key: string) => ({
	KEY_FIELDS_VISIBLE: `${key}_fields_visible`,
	KEY_FIELDS_HIDDEN: `${key}_fields_hidden`,
	KEY_FIELDS_ORDER: `${key}_fields_order`,
})
export const context = {
	set: setContext<TableContext>,
	get: getContext<TableContext>,
}
