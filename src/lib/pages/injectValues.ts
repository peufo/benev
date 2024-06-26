export type Replacer = { id: string; value: string }

export function injectValues(html: string, replacers: Replacer[]): string {
	for (const { id, value } of replacers) {
		const regexp = new RegExp(
			`<span class="suggestion" data-key="${id.replace('.', '\\.')}".*?<\/span>`,
			'g'
		)
		html = html.replaceAll(regexp, valueToHTML(value))
	}
	return html
}

function valueToHTML(value: undefined | number | boolean | string | string[]): string {
	if (value === undefined || value === null) return '[Valeur non définie]'
	if (typeof value === 'string') return value
	if (typeof value === 'number') return value.toString()
	if (typeof value === 'boolean') return value ? 'Oui' : 'Non'
	if (Array.isArray(value)) return '<ul>' + value.map((v) => `<li>${v}</li>`).join('') + '</ul>'
	console.warn('valueToHTML failed', value)
	return ''
}
