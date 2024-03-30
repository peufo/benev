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

function valueToHTML(value: number | boolean | string | string[]): string {
	if (typeof value === 'string') return value
	if (typeof value === 'number') return value.toString()
	if (typeof value === 'boolean') return value ? 'Oui' : 'Non'
	return '<ul>' + value.map((v) => `<li>${v}</li>`).join('') + '</ul>'
}
