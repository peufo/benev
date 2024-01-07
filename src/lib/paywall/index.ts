import type { Licence } from '@prisma/client'

export function sumOfLicences(licences: Licence[], type: Licence['type']): number {
	return licences.filter((l) => l.type === type).reduce((acc, cur) => acc + cur.quantity, 0)
}
