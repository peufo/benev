import type { Page } from '@playwright/test'
import { prisma, signIn, type SeededUser } from '../tests/seed'
import { mockPhoton } from '../tests/photon'
import { gotoHydrated } from '../tests/hydrated'
import { TERMS_VERSION } from '../src/lib/constant/terms'
import cuid from '@paralleldrive/cuid2'

/**
 * Les données des démos: des noms crédibles et des avatars, là où les tests se contentent de
 * « Bob The Tester ». Chaque démo repart d'un compte neuf: supprimer l'ancien emporte ses
 * évènements, et l'URL de l'évènement reste donc la même d'une prise à l'autre.
 */

const avatar = (seed: string) =>
	`https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(seed)}`

export async function seedOrganizer(page: Page): Promise<SeededUser> {
	const email = 'camille.rochat@benevio.test'
	await prisma.user.deleteMany({ where: { email } })
	const user = await prisma.user.create({
		data: {
			id: cuid.createId(),
			email,
			firstName: 'Camille',
			lastName: 'Rochat',
			isOrganizer: true,
			isEmailVerified: true,
			isTermsAccepted: true,
			termsVersion: TERMS_VERSION,
			termsAcceptedAt: new Date(),
			avatarPlaceholder: avatar('camille'),
		},
		select: { id: true, email: true, firstName: true, lastName: true },
	})
	await signIn(page, user)
	return user
}

/** L'évènement se crée par l'interface (voir `tests/seed.ts`), hors champ. */
export async function createEvent(page: Page, name = 'Festival des Lumières') {
	await mockPhoton(page)
	await gotoHydrated(page, '/me/events/create')
	await page.getByLabel("Nom de l'évènement").fill(name)
	await page.getByRole('button', { name: 'Créer mon évènement' }).click()
	await page.waitForURL('**/admin/dashboard')
	const eventId = new URL(page.url()).pathname.split('/')[1]
	return { eventId, name }
}
