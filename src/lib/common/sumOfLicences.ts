import type { Licence, LicenceType } from '@prisma/client'

export function sumOfLicences(licences: Licence[], type: LicenceType): string {
	const _licences = licences.filter((l) => l.type === type)
	const quantity = _licences.reduce((acc, cur) => acc + cur.quantity, 0)
	const quantityUsed = _licences.reduce((acc, cur) => acc + cur.quantityUsed, 0)
	return `${quantity - quantityUsed}/${quantity}`
}
