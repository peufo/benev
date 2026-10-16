import Papa from 'papaparse'

export type CsvTable = {
	headers: string[]
	rows: string[][]
}

/**
 * Le texte d'un fichier CSV, première ligne en en-têtes. papaparse devine le séparateur: Excel
 * en français écrit des `;`. Chaque ligne est ramenée au nombre de colonnes de l'en-tête.
 */
export function parseCsv(text: string): CsvTable {
	const { data } = Papa.parse<string[]>(text.replace(/^\uFEFF/, ''), { skipEmptyLines: 'greedy' })
	const [head = [], ...body] = data
	const headers = head.map((header, index) => header.trim() || `Colonne ${index + 1}`)
	const rows = body.map((row) => headers.map((_, index) => (row[index] ?? '').trim()))
	return { headers, rows }
}
