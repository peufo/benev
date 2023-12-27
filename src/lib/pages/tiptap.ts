import { generateHTML, generateJSON } from '@tiptap/html'
import { extensions } from '$lib/material/input/html/extensions'
import { jsonParse } from '$lib/jsonParse'

export const tiptap = {
	toHTML(jsonAsString: string) {
		try {
			const json = jsonParse(jsonAsString, [])
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
