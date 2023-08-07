export function normalizePath(str: string | undefined): string {
	if (!str) return ''
	return str
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replaceAll(' ', '-')
		.replace(/[\:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=]/g, '')
		.toLowerCase()
}
