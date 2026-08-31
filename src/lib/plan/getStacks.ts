import { isFreeRange } from 'perod'

type Stackable = { start: Date; end: Date; tags?: { name: string }[] }

/**
 * Répartit les périodes d'une équipe sur les lignes du planning.
 *
 * Chaque étiquette est posée d'un bloc: toutes ses périodes tiennent sur la même ligne — ou sur
 * des lignes contiguës si elle se chevauche elle-même, ce qui est irréductible — pour qu'une ligne
 * se lise comme un poste. Deux étiquettes partagent encore une ligne quand l'une tient dans les
 * trous de l'autre, donc le plan ne gagne pas de hauteur.
 */
export function getStacks<T extends Stackable>(periods: T[]): T[][] {
	if (!periods.length) return [[]]

	const stacks: T[][] = []
	for (const group of getGroups(periods)) {
		const height = getHeight(group)
		// La descente s'arrête forcément: passé les lignes existantes, le bloc atterrit sur des
		// lignes vides, où il tient par construction.
		let base = 0
		while (!place(stacks, group, base, height)) base++
	}

	return stacks
}

/** Le nom d'étiquette le plus petit, ou '' pour les périodes nues, groupées elles aussi. */
function getKey({ tags }: Stackable): string {
	if (!tags?.length) return ''
	return tags.map(({ name }) => name).toSorted()[0]
}

function getGroups<T extends Stackable>(periods: T[]): T[][] {
	const groups = new Map<string, T[]>()
	for (const period of periods) {
		const key = getKey(period)
		const group = groups.get(key)
		if (group) group.push(period)
		else groups.set(key, [period])
	}

	return (
		[...groups]
			// Ordre alphabétique: une étiquette garde son rang de ligne d'une semaine à l'autre. Les
			// périodes nues passent en dernier et se glissent dans ce que les autres laissent libre.
			.sort(([a], [b]) => (!a ? 1 : !b ? -1 : a.localeCompare(b)))
			// Le tri par début rend l'empilement minimal, et tient même quand le tableau reçu a perdu
			// l'ordre du serveur — ce que fait un glisser-déposer, qui remplace la période sur place.
			.map(([, group]) => group.toSorted((a, b) => +a.start - +b.start))
	)
}

/** Le nombre de lignes qu'un groupe réclame seul, soit son plus grand nombre de simultanées. */
function getHeight<T extends Stackable>(group: T[]): number {
	const stacks: T[][] = []
	for (const period of group) {
		const index = stacks.findIndex((stack) => isFreeRange(period, stack))
		if (index === -1) stacks.push([period])
		else stacks[index].push(period)
	}
	return stacks.length
}

/**
 * Pose le groupe entier dans la fenêtre de lignes `[base, base + height - 1]`, et ne touche à
 * `stacks` que si tout y tient: un groupe est indivisible.
 */
function place<T extends Stackable>(stacks: T[][], group: T[], base: number, height: number) {
	const rows = Array.from({ length: height }, (_, i) => [...(stacks[base + i] || [])])
	const placement: { index: number; period: T }[] = []

	for (const period of group) {
		const index = rows.findIndex((row) => isFreeRange(period, row))
		if (index === -1) return false
		rows[index].push(period)
		placement.push({ index: base + index, period })
	}

	for (const { index, period } of placement) {
		while (stacks.length <= index) stacks.push([])
		stacks[index].push(period)
	}
	return true
}
