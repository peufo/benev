import type { LicenceType } from '@prisma/client'

export const licencesLabel: Record<LicenceType, string> = {
	event: 'Évènement',
	member: 'Membre',
}
