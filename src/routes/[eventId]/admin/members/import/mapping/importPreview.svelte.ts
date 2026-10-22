import {
	buildRow,
	collectMembers,
	columnIssues,
	columnReport,
	importBlocker,
	resolveTargets,
	targetUsage,
	type ColumnReport,
	type ColumnTarget,
	type ImportField,
	type ImportRow,
	type ImportTable,
	type SkippedRow,
	type Target,
} from '#lib/member/import/index.js'

/** Lues par des getters: chaque `$derived` ne suit que ce qu'il lit vraiment. */
export type PreviewInput = {
	readonly table: ImportTable
	readonly fields: ImportField[]
	readonly firstLine: number
	readonly mapping: ColumnTarget[]
	readonly excluded: ReadonlySet<number>
}

/**
 * La validation et la conversion de la table, découpées pour qu'une cellule modifiée ne revalide
 * que sa colonne et ne reconvertisse que sa ligne. Une ligne cochée ou décochée ne fait que
 * refiltrer: `SvelteSet.has()` sur une clé absente suit tout l'ensemble, et le lire dans la
 * validation ou la conversion relancerait la table entière.
 */
export class ImportPreview {
	readonly input: PreviewInput
	targets: (Target | null)[]
	usage: Map<string, number>
	/** Ne suivent que les en-têtes et la liste des lignes, jamais leurs cellules. */
	columns: ImportColumn[]
	lines: ImportLine[]
	reports: ColumnReport[]
	members: { rows: ImportRow[]; skipped: SkippedRow[] }
	blocker: string | null

	constructor(input: PreviewInput) {
		this.input = input
		this.targets = $derived(resolveTargets(input.mapping, input.fields))
		this.usage = $derived(targetUsage(input.mapping))
		this.columns = $derived(input.table.headers.map((_, index) => new ImportColumn(this, index)))
		this.lines = $derived(
			input.table.rows.map((cells, index) => new ImportLine(this, cells, index))
		)
		this.reports = $derived(this.columns.map((column) => column.report))
		this.members = $derived(
			collectMembers(
				this.lines.filter(({ index }) => !input.excluded.has(index)).map(({ built }) => built)
			)
		)
		this.blocker = $derived(importBlocker(this.reports, input.mapping))
	}
}

class ImportColumn {
	issues: Map<number, string>
	report: ColumnReport

	constructor(preview: ImportPreview, index: number) {
		const { input } = preview
		const resolved = $derived(preview.targets[index] ?? null)
		this.issues = $derived(columnIssues(input.table.rows, index, resolved))
		this.report = $derived(
			columnReport(
				input.mapping[index] ?? null,
				resolved,
				this.issues,
				preview.usage,
				input.excluded
			)
		)
	}
}

class ImportLine {
	readonly index: number
	built: ImportRow

	constructor(preview: ImportPreview, cells: string[], index: number) {
		this.index = index
		this.built = $derived(buildRow(cells, preview.targets, index + preview.input.firstLine))
	}
}
