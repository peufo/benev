import Papa from 'papaparse'

export type CsvTable = {
	headers: string[]
	rows: string[][]
}

/**
 * Excel sous Windows enregistre ses CSV en Windows-1252, sans le dire. Un octet accentué isolé n'y
 * forme jamais une séquence UTF-8 valide: l'échec du décodage strict suffit à trancher.
 */
export function decodeCsv(buffer: ArrayBuffer): string {
	try {
		return new TextDecoder('utf-8', { fatal: true }).decode(buffer)
	} catch {
		return new TextDecoder('windows-1252').decode(buffer)
	}
}

/**
 * Un texte tabulaire, première ligne en en-têtes. papaparse devine le séparateur: Excel en
 * français écrit des `;`, un tableur copié dans le presse-papier des tabulations. Chaque ligne
 * est ramenée au nombre de colonnes de la plus longue.
 *
 * Une sélection copiée n'a souvent pas d'en-tête: `header: false` garde la première ligne comme
 * donnée et nomme les colonnes « Colonne N ».
 */
export function parseCsv(text: string, { header = true } = {}): CsvTable {
	const { data } = Papa.parse<string[]>(text.replace(/^\uFEFF/, ''), { skipEmptyLines: 'greedy' })
	const [head = [], ...body] = header ? data : [[], ...data]
	const width = body.reduce((max, row) => Math.max(max, row.length), head.length)
	const headers = Array.from(
		{ length: width },
		(_, index) => head[index]?.trim() || `Colonne ${index + 1}`
	)
	const rows = body.map((row) => headers.map((_, index) => (row[index] ?? '').trim()))
	return { headers, rows }
}
