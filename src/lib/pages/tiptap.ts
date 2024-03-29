import { generateHTML, generateJSON } from '@tiptap/html'
import type { JSONContent } from '@tiptap/core'
import { extensions } from '$lib/material/input/textRich/extensions'
import { jsonParse } from '$lib/jsonParse'

export const tiptap = {
	toHTML(jsonAsString: string) {
		try {
			const json = jsonParse<JSONContent>(jsonAsString, [])
			if (!json) return ''
			return generateHTML(json, extensions)
		} catch (err) {
			console.error(err)
			return ''
		}
	},
	toJSON(html: string) {
		try {
			const json = generateJSON(html, extensions)
			return JSON.stringify(json)
		} catch (err) {
			console.error(err)
			return ''
		}
	},
}
