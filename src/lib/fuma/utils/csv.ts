export type CSVFields<Item extends Record<string, unknown>> = Partial<
	Record<keyof Item, (item: Item) => string | number>
>

export function getCSV<Item extends Record<string, unknown>>(
	items: Item[],
	fields: CSVFields<Item>
): string {
	const headers = Object.keys(fields).join('\t')
	const rows = items.map((m: Item) =>
		Object.values(fields)
			.map((getValue) => (!!getValue ? getValue(m) : ''))
			.join('\t')
	)
	return [headers, rows.join('\r\n')].join('\r\n')
}
