import { error } from '@sveltejs/kit'
import type { Prisma } from '@prisma/client'
import type { LicenceType } from '@prisma/client'
import { prisma } from '$lib/server'

export function licences(ownerId: string) {
	async function getLicencesAvailable(type: LicenceType): Promise<number> {
		const {
			_sum: { quantity, quantityUsed },
		} = await prisma.licence.aggregate({
			where: { ownerId, type },
			_sum: {
				quantity: true,
				quantityUsed: true,
			},
		})
		if (!quantity || !quantityUsed) return 0
		return quantity - quantityUsed
	}

	async function useLicences(type: LicenceType, nb: number): Promise<Prisma.PrismaPromise<any>[]> {
		const nbAvailable = await getLicencesAvailable(type)
		if (nbAvailable < nb) throw error(403, { message: 'No licence available' })

		const _licences = await prisma.licence.findMany({
			where: { ownerId, type },
			orderBy: { createdAt: 'asc' },
		})

		const updates: Prisma.LicenceUpdateArgs[] = []
		_licences.forEach((licence) => {
			const _nbAvailable = licence.quantity - licence.quantityUsed
			if (_nbAvailable <= 0) return
			const nbUsed = Math.max(_nbAvailable, nb)
			const quantityUsed = licence.quantityUsed + nbUsed
			updates.push({
				where: { id: licence.id },
				data: { quantityUsed },
			})
		})

		return updates.map((tr) => prisma.licence.update(tr))
	}

	function createLicenceMethods(type: LicenceType) {
		return {
			get: () => getLicencesAvailable(type),
			use: (nb: number) => useLicences(type, nb),
		}
	}

	return {
		event: createLicenceMethods('event'),
		member: createLicenceMethods('member'),
	}
}
